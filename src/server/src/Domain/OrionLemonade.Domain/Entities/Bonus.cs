using OrionLemonade.Domain.Common;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class Bonus : BaseEntity
{
    public int EmployeeId { get; set; }
    public DateOnly BonusDate { get; set; }
    public BonusType BonusType { get; set; }
    public decimal Amount { get; set; }
    public string? Reason { get; set; }
    public int? CreatedByUserId { get; set; }

    // Navigation properties
    public Employee Employee { get; set; } = null!;
    public User? CreatedByUser { get; set; }
}
