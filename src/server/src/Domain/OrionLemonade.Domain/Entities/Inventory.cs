using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class Inventory
{
    public int Id { get; set; }
    public string InventoryNumber { get; set; } = string.Empty;
    public DateTime InventoryDate { get; set; }
    public int BranchId { get; set; }
    public InventoryType InventoryType { get; set; }
    public InventoryStatus Status { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? StartedByUserId { get; set; }
    public int? CompletedByUserId { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Branch Branch { get; set; } = null!;
    public User? StartedByUser { get; set; }
    public User? CompletedByUser { get; set; }
    public ICollection<InventoryItem> Items { get; set; } = new List<InventoryItem>();
}
