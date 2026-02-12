using OrionLemonade.Domain.Common;

namespace OrionLemonade.Domain.Entities;

public class EmployeeRateHistory : BaseEntity
{
    public int EmployeeId { get; set; }
    public DateOnly EffectiveDate { get; set; }
    public decimal? DailyRate { get; set; }
    public decimal? MonthlyRate { get; set; }
    public string? Reason { get; set; }
    public int? SetByUserId { get; set; }

    // Navigation properties
    public Employee Employee { get; set; } = null!;
    public User? SetByUser { get; set; }
}
