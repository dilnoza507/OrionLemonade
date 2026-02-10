namespace OrionLemonade.Domain.Entities;

public class PriceListItem
{
    public int Id { get; set; }
    public int PriceListId { get; set; }
    public int RecipeId { get; set; }
    public decimal PriceTjs { get; set; }
    public int MinOrderQuantity { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public PriceList PriceList { get; set; } = null!;
    public Recipe Recipe { get; set; } = null!;
}
