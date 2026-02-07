using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

public class IngredientWriteOffDto
{
    public int Id { get; set; }
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public int IngredientId { get; set; }
    public string IngredientName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public BaseUnit Unit { get; set; }
    public WriteOffReason Reason { get; set; }
    public DateTime WriteOffDate { get; set; }
    public string? Notes { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserLogin { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateIngredientWriteOffDto
{
    public int BranchId { get; set; }
    public int IngredientId { get; set; }
    public decimal Quantity { get; set; }
    public BaseUnit Unit { get; set; }
    public WriteOffReason Reason { get; set; }
    public DateTime WriteOffDate { get; set; }
    public string? Notes { get; set; }
}
