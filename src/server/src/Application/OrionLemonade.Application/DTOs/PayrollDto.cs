using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

#region Timesheet DTOs
public class TimesheetDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public DateOnly WorkDate { get; set; }
    public decimal HoursWorked { get; set; }
    public decimal? OvertimeHours { get; set; }
    public string? Notes { get; set; }
    public string? CreatedByUserLogin { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTimesheetDto
{
    public int EmployeeId { get; set; }
    public int BranchId { get; set; }
    public DateOnly WorkDate { get; set; }
    public decimal HoursWorked { get; set; }
    public decimal? OvertimeHours { get; set; }
    public string? Notes { get; set; }
}

public class UpdateTimesheetDto
{
    public decimal HoursWorked { get; set; }
    public decimal? OvertimeHours { get; set; }
    public string? Notes { get; set; }
}
#endregion

#region Bonus DTOs
public class BonusDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateOnly BonusDate { get; set; }
    public BonusType BonusType { get; set; }
    public string BonusTypeName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Reason { get; set; }
    public string? CreatedByUserLogin { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateBonusDto
{
    public int EmployeeId { get; set; }
    public DateOnly BonusDate { get; set; }
    public BonusType BonusType { get; set; }
    public decimal Amount { get; set; }
    public string? Reason { get; set; }
}
#endregion

#region Advance DTOs
public class AdvanceDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateOnly AdvanceDate { get; set; }
    public decimal Amount { get; set; }
    public string? Notes { get; set; }
    public string? CreatedByUserLogin { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateAdvanceDto
{
    public int EmployeeId { get; set; }
    public DateOnly AdvanceDate { get; set; }
    public decimal Amount { get; set; }
    public string? Notes { get; set; }
}
#endregion

#region PayrollCalculation DTOs
public class PayrollCalculationDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string? EmployeePosition { get; set; }
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Month { get; set; }
    public string PeriodName { get; set; } = string.Empty;
    public PayrollStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public decimal BaseSalary { get; set; }
    public decimal DailyPayTotal { get; set; }
    public decimal BonusTotal { get; set; }
    public decimal PenaltyTotal { get; set; }
    public decimal AdvanceTotal { get; set; }
    public decimal GrossTotal { get; set; }
    public decimal NetTotal { get; set; }
    public DateTime? CalculatedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? CalculatedByUserLogin { get; set; }
    public string? ApprovedByUserLogin { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PayrollCalculationDetailDto : PayrollCalculationDto
{
    public List<PayrollItemDto> Items { get; set; } = new();
}

public class PayrollItemDto
{
    public int Id { get; set; }
    public int PayrollCalculationId { get; set; }
    public PayrollItemType ItemType { get; set; }
    public string ItemTypeName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal Amount { get; set; }
}

public class CreatePayrollCalculationDto
{
    public int EmployeeId { get; set; }
    public int BranchId { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
}

public class PayrollSummaryDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string PeriodName { get; set; } = string.Empty;
    public int TotalEmployees { get; set; }
    public decimal TotalGross { get; set; }
    public decimal TotalNet { get; set; }
    public int DraftCount { get; set; }
    public int CalculatedCount { get; set; }
    public int ApprovedCount { get; set; }
    public int PaidCount { get; set; }
}
#endregion

#region EmployeeRateHistory DTOs
public class EmployeeRateHistoryDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateOnly EffectiveDate { get; set; }
    public decimal? DailyRate { get; set; }
    public decimal? MonthlyRate { get; set; }
    public string? Reason { get; set; }
    public string? SetByUserLogin { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateEmployeeRateHistoryDto
{
    public int EmployeeId { get; set; }
    public DateOnly EffectiveDate { get; set; }
    public decimal? DailyRate { get; set; }
    public decimal? MonthlyRate { get; set; }
    public string? Reason { get; set; }
}
#endregion
