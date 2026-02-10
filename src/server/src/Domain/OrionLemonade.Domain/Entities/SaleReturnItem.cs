namespace OrionLemonade.Domain.Entities;

public class SaleReturnItem
{
    public int Id { get; set; }
    public int ReturnId { get; set; }
    public int RecipeId { get; set; }
    public int Quantity { get; set; }
    public bool ReturnToStock { get; set; }

    // Navigation properties
    public SaleReturn Return { get; set; } = null!;
    public Recipe Recipe { get; set; } = null!;
}
