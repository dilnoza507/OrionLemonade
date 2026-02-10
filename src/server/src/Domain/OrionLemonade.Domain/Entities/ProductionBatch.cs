using OrionLemonade.Domain.Common;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class ProductionBatch : BaseEntity
{
    public string BatchNumber { get; set; } = string.Empty;

    public int RecipeId { get; set; }
    public Recipe? Recipe { get; set; }

    public int RecipeVersionId { get; set; }
    public RecipeVersion? RecipeVersion { get; set; }

    public int BranchId { get; set; }
    public Branch? Branch { get; set; }

    public decimal PlannedQuantity { get; set; }
    public decimal ActualQuantity { get; set; }
    public BaseUnit OutputUnit { get; set; }

    public DateTime PlannedDate { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    public BatchStatus Status { get; set; } = BatchStatus.Planned;

    public int? CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }

    public string? Notes { get; set; }

    public ICollection<BatchIngredientConsumption> IngredientConsumptions { get; set; } = new List<BatchIngredientConsumption>();
}
