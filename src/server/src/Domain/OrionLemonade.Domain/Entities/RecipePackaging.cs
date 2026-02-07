using OrionLemonade.Domain.Common;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class RecipePackaging : BaseEntity
{
    public int RecipeVersionId { get; set; }
    public RecipeVersion? RecipeVersion { get; set; }

    public int IngredientId { get; set; }
    public Ingredient? Ingredient { get; set; }

    public decimal Quantity { get; set; }
    public BaseUnit Unit { get; set; }
}
