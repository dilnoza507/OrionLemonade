using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class ProductMovement
{
    public int Id { get; set; }
    public DateTime MovementDate { get; set; }
    public int BranchId { get; set; }
    public int RecipeId { get; set; }
    public int? ProductionBatchId { get; set; }
    public ProductMovementType OperationType { get; set; }
    public int Quantity { get; set; }
    public int BalanceAfter { get; set; }
    public string? DocumentType { get; set; }
    public int? DocumentId { get; set; }
    public int? UserId { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Branch Branch { get; set; } = null!;
    public Recipe Recipe { get; set; } = null!;
    public ProductionBatch? ProductionBatch { get; set; }
    public User? User { get; set; }
}
