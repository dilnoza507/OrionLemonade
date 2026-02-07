using OrionLemonade.Domain.Common;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class IngredientMovement : BaseEntity
{
    public int BranchId { get; set; }
    public Branch? Branch { get; set; }

    public int IngredientId { get; set; }
    public Ingredient? Ingredient { get; set; }

    public MovementType MovementType { get; set; }
    public decimal Quantity { get; set; } // Positive for in, negative for out
    public BaseUnit Unit { get; set; }

    public decimal BalanceAfter { get; set; } // Stock balance after this movement

    public int? ReferenceId { get; set; } // ID of related receipt/writeoff/etc
    public string? ReferenceType { get; set; } // "Receipt", "WriteOff", "Production", etc

    public DateTime MovementDate { get; set; }
    public string? Notes { get; set; }

    public int? CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
}
