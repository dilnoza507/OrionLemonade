using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class InventoryItem
{
    public int Id { get; set; }
    public int InventoryId { get; set; }
    public int ItemId { get; set; }
    public InventoryItemType ItemType { get; set; }
    public decimal ExpectedQuantity { get; set; }
    public decimal? ActualQuantity { get; set; }
    public decimal? Discrepancy { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public Inventory Inventory { get; set; } = null!;
    public Ingredient? Ingredient { get; set; }
    public Recipe? Recipe { get; set; }
}
