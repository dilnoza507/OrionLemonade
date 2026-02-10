namespace OrionLemonade.Domain.Entities;

public class SaleItem
{
    public int Id { get; set; }
    public int SaleId { get; set; }
    public int RecipeId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPriceTjs { get; set; }
    public decimal TotalTjs { get; set; }
    public decimal UnitCostUsd { get; set; }
    public decimal UnitCostTjs { get; set; }
    public decimal ExchangeRate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Sale Sale { get; set; } = null!;
    public Recipe Recipe { get; set; } = null!;
}
