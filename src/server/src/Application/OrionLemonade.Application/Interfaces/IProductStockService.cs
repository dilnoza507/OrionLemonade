using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface IProductStockService
{
    // Stock queries
    Task<IEnumerable<ProductStockDto>> GetStocksAsync(int? branchId = null, int? recipeId = null);
    Task<ProductStockDto?> GetStockByIdAsync(int id);
    Task<IEnumerable<BranchProductStockDto>> GetStockSummaryByBranchAsync();
    Task<int> GetTotalQuantityAsync(int branchId, int recipeId);

    // Stock operations
    Task<ProductStockDto> AddStockAsync(CreateProductStockDto dto, int userId);
    Task<ProductStockDto> AdjustStockAsync(int branchId, int recipeId, AdjustProductStockDto dto, int userId);

    // Movement queries
    Task<IEnumerable<ProductMovementDto>> GetMovementsAsync(int? branchId = null, int? recipeId = null, DateTime? from = null, DateTime? to = null);
    Task<ProductMovementDto?> GetMovementByIdAsync(int id);

    // Movement operations
    Task<ProductMovementDto> RecordSaleAsync(SellProductDto dto, int userId);
    Task<ProductMovementDto> RecordWriteOffAsync(WriteOffProductDto dto, int userId);
    Task TransferAsync(TransferProductDto dto, int userId);

    // Called from ProductionService when batch is completed
    Task AddFromProductionAsync(int branchId, int recipeId, int productionBatchId, int quantity, decimal unitCostUsd, decimal unitCostTjs, decimal exchangeRate, DateTime productionDate, DateTime? expiryDate, int userId);
}
