using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface IProductionService
{
    // Batches
    Task<IEnumerable<ProductionBatchDto>> GetBatchesAsync(int? branchId = null, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
    Task<ProductionBatchDto?> GetBatchByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductionBatchDetailDto?> GetBatchDetailByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductionBatchDto> CreateBatchAsync(CreateProductionBatchDto dto, int userId, CancellationToken cancellationToken = default);
    Task<ProductionBatchDto?> UpdateBatchAsync(int id, UpdateProductionBatchDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteBatchAsync(int id, CancellationToken cancellationToken = default);

    // Batch operations
    Task<ProductionBatchDetailDto?> StartBatchAsync(int id, StartProductionDto dto, CancellationToken cancellationToken = default);
    Task<ProductionBatchDetailDto?> CompleteBatchAsync(int id, CompleteProductionDto dto, int userId, CancellationToken cancellationToken = default);
    Task<bool> CancelBatchAsync(int id, CancellationToken cancellationToken = default);

    // Summary
    Task<IEnumerable<ProductionSummaryDto>> GetSummaryAsync(DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);

    // Helpers
    Task<List<BatchIngredientConsumptionInputDto>> CalculatePlannedConsumptionAsync(int recipeVersionId, decimal plannedQuantity, CancellationToken cancellationToken = default);
}
