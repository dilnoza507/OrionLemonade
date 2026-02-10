using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class Transfer
{
    public int Id { get; set; }
    public string TransferNumber { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public int SenderBranchId { get; set; }
    public int ReceiverBranchId { get; set; }
    public TransferType TransferType { get; set; }
    public TransferStatus Status { get; set; }
    public DateTime? SentDate { get; set; }
    public DateTime? ReceivedDate { get; set; }
    public int? SentByUserId { get; set; }
    public int? ReceivedByUserId { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Branch SenderBranch { get; set; } = null!;
    public Branch ReceiverBranch { get; set; } = null!;
    public User? SentByUser { get; set; }
    public User? ReceivedByUser { get; set; }
    public ICollection<TransferItem> Items { get; set; } = new List<TransferItem>();
}
