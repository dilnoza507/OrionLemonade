using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Services;

public class ReportService : IReportService
{
    private readonly DbContext _dbContext;

    public ReportService(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<GeneralReportDto> GetGeneralReportAsync(GeneralReportRequest request, CancellationToken cancellationToken = default)
    {
        // Ensure dates are UTC
        var startDate = DateTime.SpecifyKind(request.StartDate.Date, DateTimeKind.Utc);
        var endDate = DateTime.SpecifyKind(request.EndDate.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);

        var report = new GeneralReportDto
        {
            StartDate = request.StartDate,
            EndDate = request.EndDate
        };

        // 1. Sales by Client
        report.SalesByClient = await GetSalesByClientAsync(startDate, endDate, request.BranchId, cancellationToken);
        report.SalesTotals = new SalesTotals
        {
            TotalSalesCount = report.SalesByClient.Sum(x => x.SalesCount),
            TotalQuantity = report.SalesByClient.Sum(x => x.TotalQuantity),
            TotalAmount = report.SalesByClient.Sum(x => x.TotalAmount),
            TotalPaid = report.SalesByClient.Sum(x => x.PaidAmount),
            TotalDebt = report.SalesByClient.Sum(x => x.DebtAmount)
        };

        // 2. Expenses by Category
        report.ExpensesByCategory = await GetExpensesByCategoryAsync(startDate, endDate, request.BranchId, cancellationToken);
        report.ExpensesTotal = report.ExpensesByCategory.Sum(x => x.Amount);

        // 3. Payroll
        report.Payroll = await GetPayrollAsync(startDate, endDate, request.BranchId, cancellationToken);
        report.PayrollTotals = new PayrollTotals
        {
            TotalBaseSalary = report.Payroll.Sum(x => x.BaseSalary),
            TotalAdvance = report.Payroll.Sum(x => x.Advance),
            TotalBonus = report.Payroll.Sum(x => x.Bonus),
            TotalNet = report.Payroll.Sum(x => x.NetTotal)
        };

        // 4. Procurement
        var exchangeRate = await _dbContext.Set<ExchangeRate>()
            .OrderByDescending(r => r.RateDate)
            .FirstOrDefaultAsync(cancellationToken);
        var rate = exchangeRate?.Rate ?? 10.9m;

        report.ExchangeRate = rate;
        report.Procurement = await GetProcurementAsync(startDate, endDate, request.BranchId, rate, cancellationToken);
        report.ProcurementTotalUsd = report.Procurement.Sum(x => x.TotalUsd);
        report.ProcurementTotalTjs = report.Procurement.Sum(x => x.TotalTjs);
        report.ProcurementTotalConvertedTjs = report.Procurement.Sum(x => x.TotalConvertedTjs);

        // 5. Summary
        report.Summary = new ReportSummary
        {
            Revenue = report.SalesTotals.TotalAmount,
            Expenses = report.ExpensesTotal,
            Payroll = report.PayrollTotals.TotalNet,
            Procurement = report.ProcurementTotalConvertedTjs,
            NetProfit = report.SalesTotals.TotalAmount - report.ExpensesTotal - report.PayrollTotals.TotalNet - report.ProcurementTotalConvertedTjs
        };

        return report;
    }

    private async Task<List<ClientSalesReportItem>> GetSalesByClientAsync(DateTime startDate, DateTime endDate, int? branchId, CancellationToken cancellationToken)
    {
        var query = _dbContext.Set<Sale>()
            .Include(s => s.Client)
            .Include(s => s.Items)
            .Where(s => s.SaleDate >= startDate && s.SaleDate <= endDate)
            .Where(s => s.Status != SaleStatus.Cancelled);

        if (branchId.HasValue)
        {
            query = query.Where(s => s.BranchId == branchId.Value);
        }

        var sales = await query.ToListAsync(cancellationToken);

        var result = sales
            .GroupBy(s => new { s.ClientId, s.Client.Name })
            .Select(g => new ClientSalesReportItem
            {
                ClientId = g.Key.ClientId,
                ClientName = g.Key.Name,
                SalesCount = g.Count(),
                TotalQuantity = g.SelectMany(s => s.Items).Sum(i => i.Quantity),
                TotalAmount = g.Sum(s => s.TotalTjs),
                PaidAmount = g.Sum(s => s.PaidTjs),
                DebtAmount = g.Sum(s => s.DebtTjs)
            })
            .OrderByDescending(x => x.TotalAmount)
            .ToList();

        return result;
    }

    private async Task<List<ExpenseReportItem>> GetExpensesByCategoryAsync(DateTime startDate, DateTime endDate, int? branchId, CancellationToken cancellationToken)
    {
        var query = _dbContext.Set<Expense>()
            .Include(e => e.Category)
            .Where(e => e.ExpenseDate >= startDate && e.ExpenseDate <= endDate);

        if (branchId.HasValue)
        {
            query = query.Where(e => e.BranchId == branchId.Value);
        }

        var expenses = await query.ToListAsync(cancellationToken);

        var result = expenses
            .GroupBy(e => new { e.CategoryId, CategoryName = e.Category?.Name ?? "Без категории" })
            .Select(g => new ExpenseReportItem
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.CategoryName,
                Amount = g.Sum(e => e.AmountTjs)
            })
            .OrderByDescending(x => x.Amount)
            .ToList();

        return result;
    }

    private async Task<List<PayrollReportItem>> GetPayrollAsync(DateTime startDate, DateTime endDate, int? branchId, CancellationToken cancellationToken)
    {
        // Get year and month from date range
        var startYear = startDate.Year;
        var startMonth = startDate.Month;
        var endYear = endDate.Year;
        var endMonth = endDate.Month;

        var query = _dbContext.Set<PayrollCalculation>()
            .Include(p => p.Employee)
            .Where(p => (p.Year > startYear || (p.Year == startYear && p.Month >= startMonth)) &&
                        (p.Year < endYear || (p.Year == endYear && p.Month <= endMonth)));

        if (branchId.HasValue)
        {
            query = query.Where(p => p.BranchId == branchId.Value);
        }

        var payrolls = await query.ToListAsync(cancellationToken);

        // Get timesheet data for days worked
        var employeeIds = payrolls.Select(p => p.EmployeeId).Distinct().ToList();
        var startDateOnly = DateOnly.FromDateTime(startDate);
        var endDateOnly = DateOnly.FromDateTime(endDate);

        var timesheets = await _dbContext.Set<Timesheet>()
            .Where(t => employeeIds.Contains(t.EmployeeId))
            .Where(t => t.WorkDate >= startDateOnly && t.WorkDate <= endDateOnly)
            .ToListAsync(cancellationToken);

        const decimal hoursPerWorkday = 8m;
        var daysWorkedByEmployee = timesheets
            .GroupBy(t => t.EmployeeId)
            .ToDictionary(g => g.Key, g => g.Sum(t => t.HoursWorked) / hoursPerWorkday);

        var result = payrolls
            .GroupBy(p => new { p.EmployeeId, p.Employee.FullName, p.Employee.Position })
            .Select(g => new PayrollReportItem
            {
                EmployeeId = g.Key.EmployeeId,
                EmployeeName = g.Key.FullName,
                Position = g.Key.Position ?? "",
                DaysWorked = daysWorkedByEmployee.GetValueOrDefault(g.Key.EmployeeId, 0),
                BaseSalary = g.Sum(p => p.BaseSalary + p.DailyPayTotal),
                Advance = g.Sum(p => p.AdvanceTotal),
                Bonus = g.Sum(p => p.BonusTotal),
                NetTotal = g.Sum(p => p.NetTotal)
            })
            .OrderBy(x => x.EmployeeName)
            .ToList();

        return result;
    }

    private async Task<List<ProcurementReportItem>> GetProcurementAsync(DateTime startDate, DateTime endDate, int? branchId, decimal exchangeRate, CancellationToken cancellationToken)
    {
        var query = _dbContext.Set<IngredientReceipt>()
            .Include(r => r.Ingredient)
            .Where(r => r.ReceiptDate >= startDate && r.ReceiptDate <= endDate);

        if (branchId.HasValue)
            query = query.Where(r => r.BranchId == branchId.Value);

        var receipts = await query.ToListAsync(cancellationToken);

        return receipts
            .GroupBy(r => new { r.IngredientId, Name = r.Ingredient?.Name ?? "—", Unit = r.Unit.ToString() })
            .Select(g => {
                var totalUsd = g.Sum(r => r.Currency == Domain.Enums.Currency.Usd ? r.TotalPrice : 0);
                var totalTjs = g.Sum(r => r.Currency == Domain.Enums.Currency.Tjs ? r.TotalPrice : 0);
                return new ProcurementReportItem
                {
                    IngredientId = g.Key.IngredientId,
                    IngredientName = g.Key.Name,
                    Unit = g.Key.Unit,
                    TotalQuantity = g.Sum(r => r.Quantity),
                    TotalUsd = totalUsd,
                    TotalTjs = totalTjs,
                    TotalConvertedTjs = totalTjs + totalUsd * exchangeRate,
                    ReceiptsCount = g.Count()
                };
            })
            .OrderBy(x => x.IngredientName)
            .ToList();
    }

    public async Task<byte[]> ExportGeneralReportToExcelAsync(GeneralReportRequest request, CancellationToken cancellationToken = default)
    {
        var report = await GetGeneralReportAsync(request, cancellationToken);

        using var workbook = new XLWorkbook();

        // 1. Sales by Client sheet
        var salesSheet = workbook.Worksheets.Add("Продажи по клиентам");
        salesSheet.Cell(1, 1).Value = $"Отчёт за период: {report.StartDate:dd.MM.yyyy} - {report.EndDate:dd.MM.yyyy}";
        salesSheet.Range(1, 1, 1, 6).Merge().Style.Font.Bold = true;

        var salesHeaders = new[] { "Клиент", "Продаж", "Блоков", "Сумма (TJS)", "Оплачено (TJS)", "Долг (TJS)" };
        for (int i = 0; i < salesHeaders.Length; i++)
        {
            salesSheet.Cell(3, i + 1).Value = salesHeaders[i];
            salesSheet.Cell(3, i + 1).Style.Font.Bold = true;
            salesSheet.Cell(3, i + 1).Style.Fill.BackgroundColor = XLColor.LightGray;
        }

        int row = 4;
        foreach (var item in report.SalesByClient)
        {
            salesSheet.Cell(row, 1).Value = item.ClientName;
            salesSheet.Cell(row, 2).Value = item.SalesCount;
            salesSheet.Cell(row, 3).Value = item.TotalQuantity;
            salesSheet.Cell(row, 4).Value = item.TotalAmount;
            salesSheet.Cell(row, 5).Value = item.PaidAmount;
            salesSheet.Cell(row, 6).Value = item.DebtAmount;
            row++;
        }

        // Totals row
        salesSheet.Cell(row, 1).Value = "ИТОГО";
        salesSheet.Cell(row, 1).Style.Font.Bold = true;
        salesSheet.Cell(row, 2).Value = report.SalesTotals.TotalSalesCount;
        salesSheet.Cell(row, 3).Value = report.SalesTotals.TotalQuantity;
        salesSheet.Cell(row, 4).Value = report.SalesTotals.TotalAmount;
        salesSheet.Cell(row, 5).Value = report.SalesTotals.TotalPaid;
        salesSheet.Cell(row, 6).Value = report.SalesTotals.TotalDebt;
        salesSheet.Row(row).Style.Font.Bold = true;

        salesSheet.Columns().AdjustToContents();

        // 2. Expenses sheet
        var expensesSheet = workbook.Worksheets.Add("Расходы");
        expensesSheet.Cell(1, 1).Value = $"Расходы за период: {report.StartDate:dd.MM.yyyy} - {report.EndDate:dd.MM.yyyy}";
        expensesSheet.Range(1, 1, 1, 2).Merge().Style.Font.Bold = true;

        expensesSheet.Cell(3, 1).Value = "Категория";
        expensesSheet.Cell(3, 2).Value = "Сумма (TJS)";
        expensesSheet.Range(3, 1, 3, 2).Style.Font.Bold = true;
        expensesSheet.Range(3, 1, 3, 2).Style.Fill.BackgroundColor = XLColor.LightGray;

        row = 4;
        foreach (var item in report.ExpensesByCategory)
        {
            expensesSheet.Cell(row, 1).Value = item.CategoryName;
            expensesSheet.Cell(row, 2).Value = item.Amount;
            row++;
        }

        expensesSheet.Cell(row, 1).Value = "ИТОГО";
        expensesSheet.Cell(row, 2).Value = report.ExpensesTotal;
        expensesSheet.Row(row).Style.Font.Bold = true;

        expensesSheet.Columns().AdjustToContents();

        // 3. Payroll sheet
        var payrollSheet = workbook.Worksheets.Add("Зарплата");
        payrollSheet.Cell(1, 1).Value = $"Зарплата за период: {report.StartDate:dd.MM.yyyy} - {report.EndDate:dd.MM.yyyy}";
        payrollSheet.Range(1, 1, 1, 7).Merge().Style.Font.Bold = true;

        var payrollHeaders = new[] { "Сотрудник", "Должность", "Дней", "Оклад", "Аванс", "Премия", "Итого" };
        for (int i = 0; i < payrollHeaders.Length; i++)
        {
            payrollSheet.Cell(3, i + 1).Value = payrollHeaders[i];
            payrollSheet.Cell(3, i + 1).Style.Font.Bold = true;
            payrollSheet.Cell(3, i + 1).Style.Fill.BackgroundColor = XLColor.LightGray;
        }

        row = 4;
        foreach (var item in report.Payroll)
        {
            payrollSheet.Cell(row, 1).Value = item.EmployeeName;
            payrollSheet.Cell(row, 2).Value = item.Position;
            payrollSheet.Cell(row, 3).Value = item.DaysWorked;
            payrollSheet.Cell(row, 4).Value = item.BaseSalary;
            payrollSheet.Cell(row, 5).Value = item.Advance;
            payrollSheet.Cell(row, 6).Value = item.Bonus;
            payrollSheet.Cell(row, 7).Value = item.NetTotal;
            row++;
        }

        payrollSheet.Cell(row, 1).Value = "ИТОГО";
        payrollSheet.Cell(row, 4).Value = report.PayrollTotals.TotalBaseSalary;
        payrollSheet.Cell(row, 5).Value = report.PayrollTotals.TotalAdvance;
        payrollSheet.Cell(row, 6).Value = report.PayrollTotals.TotalBonus;
        payrollSheet.Cell(row, 7).Value = report.PayrollTotals.TotalNet;
        payrollSheet.Row(row).Style.Font.Bold = true;

        payrollSheet.Columns().AdjustToContents();

        // 4. Procurement sheet
        var procSheet = workbook.Worksheets.Add("Приходы");
        procSheet.Cell(1, 1).Value = $"Приходы за период: {report.StartDate:dd.MM.yyyy} - {report.EndDate:dd.MM.yyyy}";
        procSheet.Range(1, 1, 1, 5).Merge().Style.Font.Bold = true;

        var procHeaders = new[] { "Ингредиент", "Ед. изм.", "Кол-во", "Приходов", "Сумма (USD)", "Сумма (TJS)" };
        for (int i = 0; i < procHeaders.Length; i++)
        {
            procSheet.Cell(3, i + 1).Value = procHeaders[i];
            procSheet.Cell(3, i + 1).Style.Font.Bold = true;
            procSheet.Cell(3, i + 1).Style.Fill.BackgroundColor = XLColor.LightGray;
        }

        row = 4;
        foreach (var item in report.Procurement)
        {
            procSheet.Cell(row, 1).Value = item.IngredientName;
            procSheet.Cell(row, 2).Value = item.Unit;
            procSheet.Cell(row, 3).Value = item.TotalQuantity;
            procSheet.Cell(row, 4).Value = item.ReceiptsCount;
            procSheet.Cell(row, 5).Value = item.TotalUsd;
            procSheet.Cell(row, 6).Value = item.TotalTjs;
            row++;
        }

        procSheet.Cell(row, 1).Value = "ИТОГО";
        procSheet.Cell(row, 5).Value = report.ProcurementTotalUsd;
        procSheet.Cell(row, 6).Value = report.ProcurementTotalTjs;
        procSheet.Row(row).Style.Font.Bold = true;
        procSheet.Columns().AdjustToContents();

        // 5. Summary sheet
        var summarySheet = workbook.Worksheets.Add("Итого");
        summarySheet.Cell(1, 1).Value = $"Итоговая сводка: {report.StartDate:dd.MM.yyyy} - {report.EndDate:dd.MM.yyyy}";
        summarySheet.Range(1, 1, 1, 2).Merge().Style.Font.Bold = true;

        summarySheet.Cell(3, 1).Value = "Показатель";
        summarySheet.Cell(3, 2).Value = "Сумма (TJS)";
        summarySheet.Range(3, 1, 3, 2).Style.Font.Bold = true;
        summarySheet.Range(3, 1, 3, 2).Style.Fill.BackgroundColor = XLColor.LightGray;

        summarySheet.Cell(4, 1).Value = "Выручка";
        summarySheet.Cell(4, 2).Value = report.Summary.Revenue;
        summarySheet.Cell(5, 1).Value = "Расходы";
        summarySheet.Cell(5, 2).Value = -report.Summary.Expenses;
        summarySheet.Cell(6, 1).Value = "Зарплата";
        summarySheet.Cell(6, 2).Value = -report.Summary.Payroll;
        summarySheet.Cell(7, 1).Value = $"Закупки (курс {report.ExchangeRate} TJS/USD)";
        summarySheet.Cell(7, 2).Value = -report.Summary.Procurement;
        summarySheet.Cell(8, 1).Value = "Чистая прибыль";
        summarySheet.Cell(8, 2).Value = report.Summary.NetProfit;
        summarySheet.Row(8).Style.Font.Bold = true;

        summarySheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
