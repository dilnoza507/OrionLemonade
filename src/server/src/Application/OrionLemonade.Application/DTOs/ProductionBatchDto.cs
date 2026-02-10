using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

public class ProductionBatchDto
{
    public int Id { get; set; }
    public string BatchNumber { get; set; } = string.Empty;
    public int RecipeId { get; set; }
    public string RecipeName { get; set; } = string.Empty;
    public int RecipeVersionId { get; set; }
    public int RecipeVersionNumber { get; set; }
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public decimal PlannedQuantity { get; set; }
    public decimal ActualQuantity { get; set; }
    public BaseUnit OutputUnit { get; set; }
    public DateTime PlannedDate { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public BatchStatus Status { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserLogin { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class ProductionBatchDetailDto : ProductionBatchDto
{
    public List<BatchIngredientConsumptionDto> IngredientConsumptions { get; set; } = new();
}

public class CreateProductionBatchDto
{
    public int RecipeId { get; set; }
    public int RecipeVersionId { get; set; }
    public int BranchId { get; set; }
    public decimal PlannedQuantity { get; set; }
    public BaseUnit OutputUnit { get; set; }
    public DateTime PlannedDate { get; set; }
    public string? Notes { get; set; }
}

public class UpdateProductionBatchDto
{
    public decimal PlannedQuantity { get; set; }
    public DateTime PlannedDate { get; set; }
    public string? Notes { get; set; }
}

public class StartProductionDto
{
    public List<BatchIngredientConsumptionInputDto> IngredientConsumptions { get; set; } = new();
}

public class CompleteProductionDto
{
    public decimal ActualQuantity { get; set; }
    public List<BatchIngredientConsumptionInputDto> IngredientConsumptions { get; set; } = new();
}

public class BatchIngredientConsumptionDto
{
    public int Id { get; set; }
    public int ProductionBatchId { get; set; }
    public int IngredientId { get; set; }
    public string IngredientName { get; set; } = string.Empty;
    public decimal PlannedQuantity { get; set; }
    public decimal ActualQuantity { get; set; }
    public BaseUnit Unit { get; set; }
}

public class BatchIngredientConsumptionInputDto
{
    public int IngredientId { get; set; }
    public decimal PlannedQuantity { get; set; }
    public decimal ActualQuantity { get; set; }
    public BaseUnit Unit { get; set; }
}

public class ProductionSummaryDto
{
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public int TotalBatches { get; set; }
    public int PlannedBatches { get; set; }
    public int InProgressBatches { get; set; }
    public int CompletedBatches { get; set; }
    public decimal TotalProducedVolume { get; set; }
}
