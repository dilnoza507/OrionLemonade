using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class PayrollItem
{
    public int Id { get; set; }
    public int PayrollCalculationId { get; set; }
    public PayrollItemType ItemType { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal Amount { get; set; }
    public int? ReferenceId { get; set; }
    public string? ReferenceType { get; set; }

    // Navigation properties
    public PayrollCalculation PayrollCalculation { get; set; } = null!;
}
