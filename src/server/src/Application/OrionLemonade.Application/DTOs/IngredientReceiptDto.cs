using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

public class IngredientReceiptDto
{
    public int Id { get; set; }
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public int IngredientId { get; set; }
    public string IngredientName { get; set; } = string.Empty;
    public int? SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public decimal Quantity { get; set; }
    public BaseUnit Unit { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public Currency Currency { get; set; }
    public DateTime ReceiptDate { get; set; }
    public string? DocumentNumber { get; set; }
    public string? Notes { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserLogin { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateIngredientReceiptDto
{
    public int BranchId { get; set; }
    public int IngredientId { get; set; }
    public int? SupplierId { get; set; }
    public decimal Quantity { get; set; }
    public BaseUnit Unit { get; set; }
    public decimal UnitPrice { get; set; }
    public Currency Currency { get; set; } = Currency.Uzs;
    public DateTime ReceiptDate { get; set; }
    public string? DocumentNumber { get; set; }
    public string? Notes { get; set; }
}
