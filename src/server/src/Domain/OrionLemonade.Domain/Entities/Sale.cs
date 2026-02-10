using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class Sale
{
    public int Id { get; set; }
    public string SaleNumber { get; set; } = string.Empty;
    public int BranchId { get; set; }
    public DateTime SaleDate { get; set; }
    public int ClientId { get; set; }
    public SaleStatus Status { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public decimal TotalTjs { get; set; }
    public decimal PaidTjs { get; set; }
    public decimal DebtTjs { get; set; }
    public DateTime? PaymentDueDate { get; set; }
    public string? Notes { get; set; }
    public int? CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Branch Branch { get; set; } = null!;
    public Client Client { get; set; } = null!;
    public User? CreatedByUser { get; set; }
    public ICollection<SaleItem> Items { get; set; } = new List<SaleItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
