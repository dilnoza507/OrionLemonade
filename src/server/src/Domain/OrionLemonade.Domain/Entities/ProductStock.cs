namespace OrionLemonade.Domain.Entities;

public class ProductStock
{
    public int Id { get; set; }
    public int BranchId { get; set; }
    public int RecipeId { get; set; }
    public int? ProductionBatchId { get; set; }
    public DateTime ProductionDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public int Quantity { get; set; }
    public decimal UnitCostUsd { get; set; }
    public decimal UnitCostTjs { get; set; }
    public decimal ExchangeRate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Branch Branch { get; set; } = null!;
    public Recipe Recipe { get; set; } = null!;
    public ProductionBatch? ProductionBatch { get; set; }
}
