using OrionLemonade.Domain.Common;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class Ingredient : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public IngredientCategory Category { get; set; }
    public string? Subcategory { get; set; }
    public BaseUnit BaseUnit { get; set; }
    public string? PurchaseUnit { get; set; }
    public decimal ConversionRate { get; set; } = 1;
    public decimal? MinStock { get; set; }
    public int? ShelfLifeDays { get; set; }
    public IngredientStatus Status { get; set; } = IngredientStatus.Active;
}
