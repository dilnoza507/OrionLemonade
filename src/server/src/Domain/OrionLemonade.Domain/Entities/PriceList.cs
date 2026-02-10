using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class PriceList
{
    public int Id { get; set; }
    public int? BranchId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PriceListType ListType { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Branch? Branch { get; set; }
    public ICollection<PriceListItem> Items { get; set; } = new List<PriceListItem>();
}
