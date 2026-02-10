using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class Payment
{
    public int Id { get; set; }
    public int SaleId { get; set; }
    public DateTime PaymentDate { get; set; }
    public decimal AmountTjs { get; set; }
    public PaymentMethod Method { get; set; }
    public string? Notes { get; set; }
    public int? CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Sale Sale { get; set; } = null!;
    public User? CreatedByUser { get; set; }
}
