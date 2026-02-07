using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface IWarehouseService
{
    // Stock
    Task<IEnumerable<IngredientStockDto>> GetStockByBranchAsync(int branchId, CancellationToken cancellationToken = default);
    Task<IEnumerable<IngredientStockDto>> GetAllStockAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<IngredientStockDto>> GetLowStockAsync(int? branchId = null, CancellationToken cancellationToken = default);
    Task<IngredientStockDto?> GetStockAsync(int branchId, int ingredientId, CancellationToken cancellationToken = default);
    Task<IEnumerable<IngredientStockSummaryDto>> GetStockSummaryAsync(CancellationToken cancellationToken = default);

    // Receipts
    Task<IEnumerable<IngredientReceiptDto>> GetReceiptsAsync(int? branchId = null, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
    Task<IngredientReceiptDto?> GetReceiptByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IngredientReceiptDto> CreateReceiptAsync(CreateIngredientReceiptDto dto, int userId, CancellationToken cancellationToken = default);
    Task<bool> DeleteReceiptAsync(int id, CancellationToken cancellationToken = default);

    // Write-offs
    Task<IEnumerable<IngredientWriteOffDto>> GetWriteOffsAsync(int? branchId = null, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
    Task<IngredientWriteOffDto?> GetWriteOffByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IngredientWriteOffDto> CreateWriteOffAsync(CreateIngredientWriteOffDto dto, int userId, CancellationToken cancellationToken = default);
    Task<bool> DeleteWriteOffAsync(int id, CancellationToken cancellationToken = default);

    // Movements
    Task<IEnumerable<IngredientMovementDto>> GetMovementsAsync(int? branchId = null, int? ingredientId = null, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
    Task<IngredientMovementDto> CreateAdjustmentAsync(CreateAdjustmentDto dto, int userId, CancellationToken cancellationToken = default);
}
