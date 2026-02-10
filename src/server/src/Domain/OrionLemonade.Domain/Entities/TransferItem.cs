using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class TransferItem
{
    public int Id { get; set; }
    public int TransferId { get; set; }
    public int ItemId { get; set; }
    public TransferItemType ItemType { get; set; }
    public decimal QuantitySent { get; set; }
    public decimal? QuantityReceived { get; set; }
    public decimal? Discrepancy { get; set; }
    public decimal TransferPriceUsd { get; set; }

    // Navigation properties
    public Transfer Transfer { get; set; } = null!;

    // Optional navigation - depends on ItemType
    public Ingredient? Ingredient { get; set; }
    public Recipe? Recipe { get; set; }
}
