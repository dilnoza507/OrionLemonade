using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Services;

public class PayrollService : IPayrollService
{
    private readonly DbContext _context;

    public PayrollService(DbContext context)
    {
        _context = context;
    }

    #region Timesheets
    public async Task<IEnumerable<TimesheetDto>> GetTimesheetsAsync(int? employeeId = null, int? branchId = null, int? year = null, int? month = null)
    {
        var query = _context.Set<Timesheet>()
            .Include(t => t.Employee)
            .Include(t => t.Branch)
            .Include(t => t.CreatedByUser)
            .AsQueryable();

        if (employeeId.HasValue)
            query = query.Where(t => t.EmployeeId == employeeId.Value);

        if (branchId.HasValue)
            query = query.Where(t => t.BranchId == branchId.Value);

        if (year.HasValue)
            query = query.Where(t => t.WorkDate.Year == year.Value);

        if (month.HasValue)
            query = query.Where(t => t.WorkDate.Month == month.Value);

        var timesheets = await query
            .OrderByDescending(t => t.WorkDate)
            .ThenBy(t => t.Employee.FullName)
            .ToListAsync();

        return timesheets.Select(MapToTimesheetDto);
    }

    public async Task<TimesheetDto?> GetTimesheetByIdAsync(int id)
    {
        var timesheet = await _context.Set<Timesheet>()
            .Include(t => t.Employee)
            .Include(t => t.Branch)
            .Include(t => t.CreatedByUser)
            .FirstOrDefaultAsync(t => t.Id == id);

        return timesheet == null ? null : MapToTimesheetDto(timesheet);
    }

    public async Task<TimesheetDto> CreateTimesheetAsync(CreateTimesheetDto dto, int userId)
    {
        var timesheet = new Timesheet
        {
            EmployeeId = dto.EmployeeId,
            BranchId = dto.BranchId,
            WorkDate = dto.WorkDate,
            HoursWorked = dto.HoursWorked,
            OvertimeHours = dto.OvertimeHours,
            Notes = dto.Notes,
            CreatedByUserId = userId
        };

        _context.Set<Timesheet>().Add(timesheet);
        await _context.SaveChangesAsync();

        return (await GetTimesheetByIdAsync(timesheet.Id))!;
    }

    public async Task<TimesheetDto?> UpdateTimesheetAsync(int id, UpdateTimesheetDto dto)
    {
        var timesheet = await _context.Set<Timesheet>().FindAsync(id);
        if (timesheet == null) return null;

        timesheet.HoursWorked = dto.HoursWorked;
        timesheet.OvertimeHours = dto.OvertimeHours;
        timesheet.Notes = dto.Notes;
        timesheet.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetTimesheetByIdAsync(id);
    }

    public async Task<bool> DeleteTimesheetAsync(int id)
    {
        var timesheet = await _context.Set<Timesheet>().FindAsync(id);
        if (timesheet == null) return false;

        _context.Set<Timesheet>().Remove(timesheet);
        await _context.SaveChangesAsync();
        return true;
    }

    private static TimesheetDto MapToTimesheetDto(Timesheet t) => new()
    {
        Id = t.Id,
        EmployeeId = t.EmployeeId,
        EmployeeName = t.Employee.FullName,
        BranchId = t.BranchId,
        BranchName = t.Branch.Name,
        WorkDate = t.WorkDate,
        HoursWorked = t.HoursWorked,
        OvertimeHours = t.OvertimeHours,
        Notes = t.Notes,
        CreatedByUserLogin = t.CreatedByUser?.Login,
        CreatedAt = t.CreatedAt
    };
    #endregion

    #region Bonuses
    public async Task<IEnumerable<BonusDto>> GetBonusesAsync(int? employeeId = null, int? year = null, int? month = null)
    {
        var query = _context.Set<Bonus>()
            .Include(b => b.Employee)
            .Include(b => b.CreatedByUser)
            .AsQueryable();

        if (employeeId.HasValue)
            query = query.Where(b => b.EmployeeId == employeeId.Value);

        if (year.HasValue)
            query = query.Where(b => b.BonusDate.Year == year.Value);

        if (month.HasValue)
            query = query.Where(b => b.BonusDate.Month == month.Value);

        var bonuses = await query
            .OrderByDescending(b => b.BonusDate)
            .ThenBy(b => b.Employee.FullName)
            .ToListAsync();

        return bonuses.Select(MapToBonusDto);
    }

    public async Task<BonusDto?> GetBonusByIdAsync(int id)
    {
        var bonus = await _context.Set<Bonus>()
            .Include(b => b.Employee)
            .Include(b => b.CreatedByUser)
            .FirstOrDefaultAsync(b => b.Id == id);

        return bonus == null ? null : MapToBonusDto(bonus);
    }

    public async Task<BonusDto> CreateBonusAsync(CreateBonusDto dto, int userId)
    {
        var bonus = new Bonus
        {
            EmployeeId = dto.EmployeeId,
            BonusDate = dto.BonusDate,
            BonusType = dto.BonusType,
            Amount = dto.Amount,
            Reason = dto.Reason,
            CreatedByUserId = userId
        };

        _context.Set<Bonus>().Add(bonus);
        await _context.SaveChangesAsync();

        return (await GetBonusByIdAsync(bonus.Id))!;
    }

    public async Task<bool> DeleteBonusAsync(int id)
    {
        var bonus = await _context.Set<Bonus>().FindAsync(id);
        if (bonus == null) return false;

        _context.Set<Bonus>().Remove(bonus);
        await _context.SaveChangesAsync();
        return true;
    }

    private static BonusDto MapToBonusDto(Bonus b) => new()
    {
        Id = b.Id,
        EmployeeId = b.EmployeeId,
        EmployeeName = b.Employee.FullName,
        BonusDate = b.BonusDate,
        BonusType = b.BonusType,
        BonusTypeName = b.BonusType == BonusType.Bonus ? "Премия" : "Штраф",
        Amount = b.Amount,
        Reason = b.Reason,
        CreatedByUserLogin = b.CreatedByUser?.Login,
        CreatedAt = b.CreatedAt
    };
    #endregion

    #region Advances
    public async Task<IEnumerable<AdvanceDto>> GetAdvancesAsync(int? employeeId = null, int? year = null, int? month = null)
    {
        var query = _context.Set<Advance>()
            .Include(a => a.Employee)
            .Include(a => a.CreatedByUser)
            .AsQueryable();

        if (employeeId.HasValue)
            query = query.Where(a => a.EmployeeId == employeeId.Value);

        if (year.HasValue)
            query = query.Where(a => a.AdvanceDate.Year == year.Value);

        if (month.HasValue)
            query = query.Where(a => a.AdvanceDate.Month == month.Value);

        var advances = await query
            .OrderByDescending(a => a.AdvanceDate)
            .ThenBy(a => a.Employee.FullName)
            .ToListAsync();

        return advances.Select(MapToAdvanceDto);
    }

    public async Task<AdvanceDto?> GetAdvanceByIdAsync(int id)
    {
        var advance = await _context.Set<Advance>()
            .Include(a => a.Employee)
            .Include(a => a.CreatedByUser)
            .FirstOrDefaultAsync(a => a.Id == id);

        return advance == null ? null : MapToAdvanceDto(advance);
    }

    public async Task<AdvanceDto> CreateAdvanceAsync(CreateAdvanceDto dto, int userId)
    {
        var advance = new Advance
        {
            EmployeeId = dto.EmployeeId,
            AdvanceDate = dto.AdvanceDate,
            Amount = dto.Amount,
            Notes = dto.Notes,
            CreatedByUserId = userId
        };

        _context.Set<Advance>().Add(advance);
        await _context.SaveChangesAsync();

        return (await GetAdvanceByIdAsync(advance.Id))!;
    }

    public async Task<bool> DeleteAdvanceAsync(int id)
    {
        var advance = await _context.Set<Advance>().FindAsync(id);
        if (advance == null) return false;

        _context.Set<Advance>().Remove(advance);
        await _context.SaveChangesAsync();
        return true;
    }

    private static AdvanceDto MapToAdvanceDto(Advance a) => new()
    {
        Id = a.Id,
        EmployeeId = a.EmployeeId,
        EmployeeName = a.Employee.FullName,
        AdvanceDate = a.AdvanceDate,
        Amount = a.Amount,
        Notes = a.Notes,
        CreatedByUserLogin = a.CreatedByUser?.Login,
        CreatedAt = a.CreatedAt
    };
    #endregion

    #region Payroll Calculations
    public async Task<IEnumerable<PayrollCalculationDto>> GetPayrollCalculationsAsync(int? branchId = null, int? year = null, int? month = null)
    {
        var query = _context.Set<PayrollCalculation>()
            .Include(p => p.Employee)
            .Include(p => p.Branch)
            .Include(p => p.CalculatedByUser)
            .Include(p => p.ApprovedByUser)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(p => p.BranchId == branchId.Value);

        if (year.HasValue)
            query = query.Where(p => p.Year == year.Value);

        if (month.HasValue)
            query = query.Where(p => p.Month == month.Value);

        var calculations = await query
            .OrderByDescending(p => p.Year)
            .ThenByDescending(p => p.Month)
            .ThenBy(p => p.Employee.FullName)
            .ToListAsync();

        return calculations.Select(MapToPayrollCalculationDto);
    }

    public async Task<PayrollCalculationDto?> GetPayrollCalculationByIdAsync(int id)
    {
        var calculation = await _context.Set<PayrollCalculation>()
            .Include(p => p.Employee)
            .Include(p => p.Branch)
            .Include(p => p.CalculatedByUser)
            .Include(p => p.ApprovedByUser)
            .FirstOrDefaultAsync(p => p.Id == id);

        return calculation == null ? null : MapToPayrollCalculationDto(calculation);
    }

    public async Task<PayrollCalculationDetailDto?> GetPayrollCalculationDetailAsync(int id)
    {
        var calculation = await _context.Set<PayrollCalculation>()
            .Include(p => p.Employee)
            .Include(p => p.Branch)
            .Include(p => p.CalculatedByUser)
            .Include(p => p.ApprovedByUser)
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == id);

        return calculation == null ? null : MapToPayrollCalculationDetailDto(calculation);
    }

    public async Task<PayrollCalculationDetailDto> CreatePayrollCalculationAsync(CreatePayrollCalculationDto dto, int userId)
    {
        // Check if calculation already exists for this employee/period
        var existing = await _context.Set<PayrollCalculation>()
            .FirstOrDefaultAsync(p => p.EmployeeId == dto.EmployeeId && p.Year == dto.Year && p.Month == dto.Month);

        if (existing != null)
            throw new InvalidOperationException($"Расчет зарплаты для данного сотрудника за {dto.Month:00}/{dto.Year} уже существует");

        var calculation = new PayrollCalculation
        {
            EmployeeId = dto.EmployeeId,
            BranchId = dto.BranchId,
            Year = dto.Year,
            Month = dto.Month,
            Status = PayrollStatus.Draft
        };

        _context.Set<PayrollCalculation>().Add(calculation);
        await _context.SaveChangesAsync();

        return (await GetPayrollCalculationDetailAsync(calculation.Id))!;
    }

    public async Task<PayrollCalculationDto?> CalculatePayrollAsync(int id, int userId)
    {
        var calculation = await _context.Set<PayrollCalculation>()
            .Include(p => p.Employee)
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (calculation == null) return null;

        if (calculation.Status != PayrollStatus.Draft)
            throw new InvalidOperationException("Можно рассчитать только черновик");

        // Clear existing items
        _context.Set<PayrollItem>().RemoveRange(calculation.Items);

        var startDate = new DateOnly(calculation.Year, calculation.Month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        // Get employee's rate - first check history, then fall back to Employee record
        var historyRate = await _context.Set<EmployeeRateHistory>()
            .Where(r => r.EmployeeId == calculation.EmployeeId && r.EffectiveDate <= endDate)
            .OrderByDescending(r => r.EffectiveDate)
            .FirstOrDefaultAsync();

        // Use rates from history if exists, otherwise from Employee
        var dailyRate = historyRate?.DailyRate ?? calculation.Employee.DailyRate;

        // Calculate daily pay from timesheets (days × daily rate)
        var timesheets = await _context.Set<Timesheet>()
            .Where(t => t.EmployeeId == calculation.EmployeeId && t.WorkDate >= startDate && t.WorkDate <= endDate)
            .ToListAsync();

        decimal dailyPayTotal = 0;
        if (timesheets.Any() && dailyRate > 0)
        {
            var daysWorked = timesheets.Count;

            if (daysWorked > 0)
            {
                var dailyPay = daysWorked * dailyRate.Value;
                dailyPayTotal += dailyPay;
                calculation.Items.Add(new PayrollItem
                {
                    PayrollCalculationId = calculation.Id,
                    ItemType = PayrollItemType.DailyPay,
                    Description = "Оплата за дни",
                    Quantity = daysWorked,
                    Rate = dailyRate.Value,
                    Amount = dailyPay
                });
            }
        }
        calculation.DailyPayTotal = dailyPayTotal;

        // Calculate bonuses
        var bonuses = await _context.Set<Bonus>()
            .Where(b => b.EmployeeId == calculation.EmployeeId && b.BonusDate >= startDate && b.BonusDate <= endDate && b.BonusType == BonusType.Bonus)
            .ToListAsync();

        decimal bonusTotal = 0;
        foreach (var bonus in bonuses)
        {
            bonusTotal += bonus.Amount;
            calculation.Items.Add(new PayrollItem
            {
                PayrollCalculationId = calculation.Id,
                ItemType = PayrollItemType.Bonus,
                Description = bonus.Reason ?? "Премия",
                Quantity = 1,
                Rate = bonus.Amount,
                Amount = bonus.Amount,
                ReferenceId = bonus.Id,
                ReferenceType = "Bonus"
            });
        }
        calculation.BonusTotal = bonusTotal;

        // Calculate penalties
        var penalties = await _context.Set<Bonus>()
            .Where(b => b.EmployeeId == calculation.EmployeeId && b.BonusDate >= startDate && b.BonusDate <= endDate && b.BonusType == BonusType.Penalty)
            .ToListAsync();

        decimal penaltyTotal = 0;
        foreach (var penalty in penalties)
        {
            penaltyTotal += penalty.Amount;
            calculation.Items.Add(new PayrollItem
            {
                PayrollCalculationId = calculation.Id,
                ItemType = PayrollItemType.Penalty,
                Description = penalty.Reason ?? "Штраф",
                Quantity = 1,
                Rate = penalty.Amount,
                Amount = -penalty.Amount,
                ReferenceId = penalty.Id,
                ReferenceType = "Bonus"
            });
        }
        calculation.PenaltyTotal = penaltyTotal;

        // Calculate advances
        var advances = await _context.Set<Advance>()
            .Where(a => a.EmployeeId == calculation.EmployeeId && a.AdvanceDate >= startDate && a.AdvanceDate <= endDate)
            .ToListAsync();

        decimal advanceTotal = 0;
        foreach (var advance in advances)
        {
            advanceTotal += advance.Amount;
            calculation.Items.Add(new PayrollItem
            {
                PayrollCalculationId = calculation.Id,
                ItemType = PayrollItemType.Advance,
                Description = advance.Notes ?? "Аванс",
                Quantity = 1,
                Rate = advance.Amount,
                Amount = -advance.Amount,
                ReferenceId = advance.Id,
                ReferenceType = "Advance"
            });
        }
        calculation.AdvanceTotal = advanceTotal;

        // Calculate totals
        calculation.GrossTotal = calculation.DailyPayTotal + calculation.BonusTotal;
        calculation.NetTotal = calculation.GrossTotal - calculation.PenaltyTotal - calculation.AdvanceTotal;

        calculation.Status = PayrollStatus.Calculated;
        calculation.CalculatedAt = DateTime.UtcNow;
        calculation.CalculatedByUserId = userId;
        calculation.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetPayrollCalculationByIdAsync(id);
    }

    public async Task<PayrollCalculationDto?> ApprovePayrollAsync(int id, int userId)
    {
        var calculation = await _context.Set<PayrollCalculation>().FindAsync(id);
        if (calculation == null) return null;

        if (calculation.Status != PayrollStatus.Calculated)
            throw new InvalidOperationException("Можно утвердить только рассчитанную ведомость");

        calculation.Status = PayrollStatus.Approved;
        calculation.ApprovedAt = DateTime.UtcNow;
        calculation.ApprovedByUserId = userId;
        calculation.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetPayrollCalculationByIdAsync(id);
    }

    public async Task<PayrollCalculationDto?> MarkAsPaidAsync(int id, int userId)
    {
        var calculation = await _context.Set<PayrollCalculation>().FindAsync(id);
        if (calculation == null) return null;

        if (calculation.Status != PayrollStatus.Approved)
            throw new InvalidOperationException("Можно отметить оплаченной только утвержденную ведомость");

        calculation.Status = PayrollStatus.Paid;
        calculation.PaidAt = DateTime.UtcNow;
        calculation.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetPayrollCalculationByIdAsync(id);
    }

    public async Task<PayrollCalculationDto?> CancelPayrollAsync(int id)
    {
        var calculation = await _context.Set<PayrollCalculation>().FindAsync(id);
        if (calculation == null) return null;

        if (calculation.Status == PayrollStatus.Paid)
            throw new InvalidOperationException("Нельзя отменить оплаченную ведомость");

        calculation.Status = PayrollStatus.Cancelled;
        calculation.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetPayrollCalculationByIdAsync(id);
    }

    public async Task<bool> DeletePayrollAsync(int id)
    {
        var calculation = await _context.Set<PayrollCalculation>()
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (calculation == null) return false;

        if (calculation.Status == PayrollStatus.Paid)
            throw new InvalidOperationException("Нельзя удалить оплаченную ведомость");

        _context.Set<PayrollItem>().RemoveRange(calculation.Items);
        _context.Set<PayrollCalculation>().Remove(calculation);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<PayrollSummaryDto> GetPayrollSummaryAsync(int year, int month, int? branchId = null)
    {
        var query = _context.Set<PayrollCalculation>()
            .Where(p => p.Year == year && p.Month == month);

        if (branchId.HasValue)
            query = query.Where(p => p.BranchId == branchId.Value);

        var calculations = await query.ToListAsync();

        var monthNames = new[] { "", "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" };

        return new PayrollSummaryDto
        {
            Year = year,
            Month = month,
            PeriodName = $"{monthNames[month]} {year}",
            TotalEmployees = calculations.Count,
            TotalGross = calculations.Sum(c => c.GrossTotal),
            TotalNet = calculations.Sum(c => c.NetTotal),
            DraftCount = calculations.Count(c => c.Status == PayrollStatus.Draft),
            CalculatedCount = calculations.Count(c => c.Status == PayrollStatus.Calculated),
            ApprovedCount = calculations.Count(c => c.Status == PayrollStatus.Approved),
            PaidCount = calculations.Count(c => c.Status == PayrollStatus.Paid)
        };
    }

    private static PayrollCalculationDto MapToPayrollCalculationDto(PayrollCalculation p)
    {
        var monthNames = new[] { "", "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" };
        var statusNames = new Dictionary<PayrollStatus, string>
        {
            { PayrollStatus.Draft, "Черновик" },
            { PayrollStatus.Calculated, "Рассчитано" },
            { PayrollStatus.Approved, "Утверждено" },
            { PayrollStatus.Paid, "Оплачено" },
            { PayrollStatus.Cancelled, "Отменено" }
        };

        return new PayrollCalculationDto
        {
            Id = p.Id,
            EmployeeId = p.EmployeeId,
            EmployeeName = p.Employee.FullName,
            EmployeePosition = p.Employee.Position,
            BranchId = p.BranchId,
            BranchName = p.Branch.Name,
            Year = p.Year,
            Month = p.Month,
            PeriodName = $"{monthNames[p.Month]} {p.Year}",
            Status = p.Status,
            StatusName = statusNames[p.Status],
            BaseSalary = p.BaseSalary,
            DailyPayTotal = p.DailyPayTotal,
            BonusTotal = p.BonusTotal,
            PenaltyTotal = p.PenaltyTotal,
            AdvanceTotal = p.AdvanceTotal,
            GrossTotal = p.GrossTotal,
            NetTotal = p.NetTotal,
            CalculatedAt = p.CalculatedAt,
            ApprovedAt = p.ApprovedAt,
            PaidAt = p.PaidAt,
            CalculatedByUserLogin = p.CalculatedByUser?.Login,
            ApprovedByUserLogin = p.ApprovedByUser?.Login,
            Notes = p.Notes,
            CreatedAt = p.CreatedAt
        };
    }

    private static PayrollCalculationDetailDto MapToPayrollCalculationDetailDto(PayrollCalculation p)
    {
        var itemTypeNames = new Dictionary<PayrollItemType, string>
        {
            { PayrollItemType.BaseSalary, "Оклад" },
            { PayrollItemType.DailyPay, "Оплата за дни" },
            { PayrollItemType.Bonus, "Премия" },
            { PayrollItemType.Penalty, "Штраф" },
            { PayrollItemType.Advance, "Аванс" },
            { PayrollItemType.Deduction, "Удержание" }
        };

        var dto = MapToPayrollCalculationDto(p);
        return new PayrollCalculationDetailDto
        {
            Id = dto.Id,
            EmployeeId = dto.EmployeeId,
            EmployeeName = dto.EmployeeName,
            EmployeePosition = dto.EmployeePosition,
            BranchId = dto.BranchId,
            BranchName = dto.BranchName,
            Year = dto.Year,
            Month = dto.Month,
            PeriodName = dto.PeriodName,
            Status = dto.Status,
            StatusName = dto.StatusName,
            BaseSalary = dto.BaseSalary,
            DailyPayTotal = dto.DailyPayTotal,
            BonusTotal = dto.BonusTotal,
            PenaltyTotal = dto.PenaltyTotal,
            AdvanceTotal = dto.AdvanceTotal,
            GrossTotal = dto.GrossTotal,
            NetTotal = dto.NetTotal,
            CalculatedAt = dto.CalculatedAt,
            ApprovedAt = dto.ApprovedAt,
            PaidAt = dto.PaidAt,
            CalculatedByUserLogin = dto.CalculatedByUserLogin,
            ApprovedByUserLogin = dto.ApprovedByUserLogin,
            Notes = dto.Notes,
            CreatedAt = dto.CreatedAt,
            Items = p.Items.Select(i => new PayrollItemDto
            {
                Id = i.Id,
                PayrollCalculationId = i.PayrollCalculationId,
                ItemType = i.ItemType,
                ItemTypeName = itemTypeNames[i.ItemType],
                Description = i.Description,
                Quantity = i.Quantity,
                Rate = i.Rate,
                Amount = i.Amount
            }).ToList()
        };
    }
    #endregion

    #region Employee Rate History
    public async Task<IEnumerable<EmployeeRateHistoryDto>> GetEmployeeRateHistoryAsync(int employeeId)
    {
        var history = await _context.Set<EmployeeRateHistory>()
            .Include(r => r.Employee)
            .Include(r => r.SetByUser)
            .Where(r => r.EmployeeId == employeeId)
            .OrderByDescending(r => r.EffectiveDate)
            .ToListAsync();

        return history.Select(r => new EmployeeRateHistoryDto
        {
            Id = r.Id,
            EmployeeId = r.EmployeeId,
            EmployeeName = r.Employee.FullName,
            EffectiveDate = r.EffectiveDate,
            DailyRate = r.DailyRate,
            MonthlyRate = r.MonthlyRate,
            Reason = r.Reason,
            SetByUserLogin = r.SetByUser?.Login,
            CreatedAt = r.CreatedAt
        });
    }

    public async Task<EmployeeRateHistoryDto> CreateEmployeeRateHistoryAsync(CreateEmployeeRateHistoryDto dto, int userId)
    {
        var history = new EmployeeRateHistory
        {
            EmployeeId = dto.EmployeeId,
            EffectiveDate = dto.EffectiveDate,
            DailyRate = dto.DailyRate,
            MonthlyRate = dto.MonthlyRate,
            Reason = dto.Reason,
            SetByUserId = userId
        };

        _context.Set<EmployeeRateHistory>().Add(history);
        await _context.SaveChangesAsync();

        var created = await _context.Set<EmployeeRateHistory>()
            .Include(r => r.Employee)
            .Include(r => r.SetByUser)
            .FirstAsync(r => r.Id == history.Id);

        return new EmployeeRateHistoryDto
        {
            Id = created.Id,
            EmployeeId = created.EmployeeId,
            EmployeeName = created.Employee.FullName,
            EffectiveDate = created.EffectiveDate,
            DailyRate = created.DailyRate,
            MonthlyRate = created.MonthlyRate,
            Reason = created.Reason,
            SetByUserLogin = created.SetByUser?.Login,
            CreatedAt = created.CreatedAt
        };
    }
    #endregion
}
