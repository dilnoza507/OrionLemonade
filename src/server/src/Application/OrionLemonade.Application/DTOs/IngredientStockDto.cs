using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

public class IngredientStockDto
{
    public int Id { get; set; }
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public int IngredientId { get; set; }
    public string IngredientName { get; set; } = string.Empty;
    public IngredientCategory IngredientCategory { get; set; }
    public decimal Quantity { get; set; }
    public BaseUnit Unit { get; set; }
    public decimal? MinStock { get; set; }
    public bool IsLowStock { get; set; }
    public DateTime LastMovementAt { get; set; }
}

public class IngredientStockSummaryDto
{
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public int TotalItems { get; set; }
    public int LowStockItems { get; set; }
    public int OutOfStockItems { get; set; }
}
