using OrionLemonade.Domain.Common;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class BatchIngredientConsumption : BaseEntity
{
    public int ProductionBatchId { get; set; }
    public ProductionBatch? ProductionBatch { get; set; }

    public int IngredientId { get; set; }
    public Ingredient? Ingredient { get; set; }

    public decimal PlannedQuantity { get; set; }
    public decimal ActualQuantity { get; set; }
    public BaseUnit Unit { get; set; }
}
