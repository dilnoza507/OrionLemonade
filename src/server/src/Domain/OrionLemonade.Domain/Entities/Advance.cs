using OrionLemonade.Domain.Common;

namespace OrionLemonade.Domain.Entities;

public class Advance : BaseEntity
{
    public int EmployeeId { get; set; }
    public DateOnly AdvanceDate { get; set; }
    public decimal Amount { get; set; }
    public string? Notes { get; set; }
    public int? CreatedByUserId { get; set; }

    // Navigation properties
    public Employee Employee { get; set; } = null!;
    public User? CreatedByUser { get; set; }
}
