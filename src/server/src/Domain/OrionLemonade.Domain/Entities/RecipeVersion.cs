using OrionLemonade.Domain.Common;

namespace OrionLemonade.Domain.Entities;

public class RecipeVersion : BaseEntity
{
    public int RecipeId { get; set; }
    public Recipe? Recipe { get; set; }

    public int VersionNumber { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }

    public int? CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }

    public ICollection<RecipeIngredient> Ingredients { get; set; } = new List<RecipeIngredient>();
    public ICollection<RecipePackaging> Packaging { get; set; } = new List<RecipePackaging>();
}
