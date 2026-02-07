using OrionLemonade.Domain.Common;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class IngredientWriteOff : BaseEntity
{
    public int BranchId { get; set; }
    public Branch? Branch { get; set; }

    public int IngredientId { get; set; }
    public Ingredient? Ingredient { get; set; }

    public decimal Quantity { get; set; }
    public BaseUnit Unit { get; set; }

    public WriteOffReason Reason { get; set; }
    public DateTime WriteOffDate { get; set; }
    public string? Notes { get; set; }

    public int? CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
}
