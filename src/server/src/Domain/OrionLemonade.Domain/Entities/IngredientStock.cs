using OrionLemonade.Domain.Common;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class IngredientStock : BaseEntity
{
    public int BranchId { get; set; }
    public Branch? Branch { get; set; }

    public int IngredientId { get; set; }
    public Ingredient? Ingredient { get; set; }

    public decimal Quantity { get; set; }
    public BaseUnit Unit { get; set; }

    public DateTime LastMovementAt { get; set; }
}
