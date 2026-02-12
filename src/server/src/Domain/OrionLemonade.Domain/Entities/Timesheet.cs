using OrionLemonade.Domain.Common;

namespace OrionLemonade.Domain.Entities;

public class Timesheet : BaseEntity
{
    public int EmployeeId { get; set; }
    public int BranchId { get; set; }
    public DateOnly WorkDate { get; set; }
    public decimal HoursWorked { get; set; }
    public decimal? OvertimeHours { get; set; }
    public string? Notes { get; set; }
    public int? CreatedByUserId { get; set; }

    // Navigation properties
    public Employee Employee { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public User? CreatedByUser { get; set; }
}
