using OrionLemonade.Domain.Common;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class Employee : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string? Position { get; set; }
    public string? Phone { get; set; }
    public DateOnly? HireDate { get; set; }
    public decimal? DailyRate { get; set; }
    public decimal? MonthlyRate { get; set; }
    public int? BranchId { get; set; }
    public Branch? Branch { get; set; }
    public EmployeeStatus Status { get; set; } = EmployeeStatus.Active;
}
