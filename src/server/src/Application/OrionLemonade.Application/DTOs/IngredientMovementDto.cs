using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

public class IngredientMovementDto
{
    public int Id { get; set; }
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public int IngredientId { get; set; }
    public string IngredientName { get; set; } = string.Empty;
    public MovementType MovementType { get; set; }
    public decimal Quantity { get; set; }
    public BaseUnit Unit { get; set; }
    public decimal BalanceAfter { get; set; }
    public int? ReferenceId { get; set; }
    public string? ReferenceType { get; set; }
    public DateTime MovementDate { get; set; }
    public string? Notes { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserLogin { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateAdjustmentDto
{
    public int BranchId { get; set; }
    public int IngredientId { get; set; }
    public decimal NewQuantity { get; set; }
    public BaseUnit Unit { get; set; }
    public string? Notes { get; set; }
}
