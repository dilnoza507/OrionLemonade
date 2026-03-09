namespace OrionLemonade.Application.DTOs;

public class GeneralReportDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<ClientSalesReportItem> SalesByClient { get; set; } = new();
    public SalesTotals SalesTotals { get; set; } = new();
    public List<ExpenseReportItem> ExpensesByCategory { get; set; } = new();
    public decimal ExpensesTotal { get; set; }
    public List<PayrollReportItem> Payroll { get; set; } = new();
    public PayrollTotals PayrollTotals { get; set; } = new();
    public ReportSummary Summary { get; set; } = new();
}

public class ClientSalesReportItem
{
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public int SalesCount { get; set; }
    public int TotalQuantity { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal DebtAmount { get; set; }
}

public class SalesTotals
{
    public int TotalSalesCount { get; set; }
    public int TotalQuantity { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal TotalDebt { get; set; }
}

public class ExpenseReportItem
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class PayrollReportItem
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public int DaysWorked { get; set; }
    public decimal BaseSalary { get; set; }
    public decimal Advance { get; set; }
    public decimal Bonus { get; set; }
    public decimal NetTotal { get; set; }
}

public class PayrollTotals
{
    public decimal TotalBaseSalary { get; set; }
    public decimal TotalAdvance { get; set; }
    public decimal TotalBonus { get; set; }
    public decimal TotalNet { get; set; }
}

public class ReportSummary
{
    public decimal Revenue { get; set; }
    public decimal Expenses { get; set; }
    public decimal Payroll { get; set; }
    public decimal NetProfit { get; set; }
}

public class GeneralReportRequest
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int? BranchId { get; set; }
}
