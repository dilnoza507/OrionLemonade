using OrionLemonade.Domain.Common;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class IngredientReceipt : BaseEntity
{
    public int BranchId { get; set; }
    public Branch? Branch { get; set; }

    public int IngredientId { get; set; }
    public Ingredient? Ingredient { get; set; }

    public int? SupplierId { get; set; }
    public Supplier? Supplier { get; set; }

    public decimal Quantity { get; set; }
    public BaseUnit Unit { get; set; }

    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public Currency Currency { get; set; } = Enums.Currency.Uzs;

    public DateTime ReceiptDate { get; set; }
    public string? DocumentNumber { get; set; }
    public string? Notes { get; set; }

    public int? CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
}
