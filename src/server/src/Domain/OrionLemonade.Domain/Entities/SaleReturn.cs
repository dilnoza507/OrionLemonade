using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class SaleReturn
{
    public int Id { get; set; }
    public string ReturnNumber { get; set; } = string.Empty;
    public int BranchId { get; set; }
    public DateTime ReturnDate { get; set; }
    public int SaleId { get; set; }
    public int ClientId { get; set; }
    public ReturnReason Reason { get; set; }
    public string? Comment { get; set; }
    public int? CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Branch Branch { get; set; } = null!;
    public Sale Sale { get; set; } = null!;
    public Client Client { get; set; } = null!;
    public User? CreatedByUser { get; set; }
    public ICollection<SaleReturnItem> Items { get; set; } = new List<SaleReturnItem>();
}
