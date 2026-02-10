using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Services;

public class ProductionService : IProductionService
{
    private readonly DbContext _dbContext;
    private readonly IProductStockService _productStockService;

    public ProductionService(DbContext dbContext, IProductStockService productStockService)
    {
        _dbContext = dbContext;
        _productStockService = productStockService;
    }

    #region Batches

    public async Task<IEnumerable<ProductionBatchDto>> GetBatchesAsync(int? branchId = null, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<ProductionBatch>()
            .Include(b => b.Recipe)
            .Include(b => b.RecipeVersion)
            .Include(b => b.Branch)
            .Include(b => b.CreatedByUser)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(b => b.BranchId == branchId.Value);

        if (from.HasValue)
            query = query.Where(b => b.PlannedDate >= from.Value);

        if (to.HasValue)
            query = query.Where(b => b.PlannedDate <= to.Value);

        var batches = await query
            .OrderByDescending(b => b.PlannedDate)
            .ThenByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);

        return batches.Select(MapToDto);
    }

    public async Task<ProductionBatchDto?> GetBatchByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var batch = await _dbContext.Set<ProductionBatch>()
            .Include(b => b.Recipe)
            .Include(b => b.RecipeVersion)
            .Include(b => b.Branch)
            .Include(b => b.CreatedByUser)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

        return batch is null ? null : MapToDto(batch);
    }

    public async Task<ProductionBatchDetailDto?> GetBatchDetailByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var batch = await _dbContext.Set<ProductionBatch>()
            .Include(b => b.Recipe)
            .Include(b => b.RecipeVersion)
            .Include(b => b.Branch)
            .Include(b => b.CreatedByUser)
            .Include(b => b.IngredientConsumptions)
                .ThenInclude(c => c.Ingredient)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

        return batch is null ? null : MapToDetailDto(batch);
    }

    public async Task<ProductionBatchDto> CreateBatchAsync(CreateProductionBatchDto dto, int userId, CancellationToken cancellationToken = default)
    {
        // Generate batch number
        var today = DateTime.UtcNow.Date;
        var batchCount = await _dbContext.Set<ProductionBatch>()
            .CountAsync(b => b.CreatedAt.Date == today, cancellationToken);

        var batchNumber = $"B-{today:yyyyMMdd}-{(batchCount + 1):D3}";

        var batch = new ProductionBatch
        {
            BatchNumber = batchNumber,
            RecipeId = dto.RecipeId,
            RecipeVersionId = dto.RecipeVersionId,
            BranchId = dto.BranchId,
            PlannedQuantity = dto.PlannedQuantity,
            ActualQuantity = 0,
            OutputUnit = dto.OutputUnit,
            PlannedDate = dto.PlannedDate,
            Status = BatchStatus.Planned,
            CreatedByUserId = userId,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<ProductionBatch>().Add(batch);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Calculate and save planned consumption
        var plannedConsumption = await CalculatePlannedConsumptionAsync(dto.RecipeVersionId, dto.PlannedQuantity, cancellationToken);

        foreach (var consumption in plannedConsumption)
        {
            var entity = new BatchIngredientConsumption
            {
                ProductionBatchId = batch.Id,
                IngredientId = consumption.IngredientId,
                PlannedQuantity = consumption.PlannedQuantity,
                ActualQuantity = 0,
                Unit = consumption.Unit,
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.Set<BatchIngredientConsumption>().Add(entity);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return (await GetBatchByIdAsync(batch.Id, cancellationToken))!;
    }

    public async Task<ProductionBatchDto?> UpdateBatchAsync(int id, UpdateProductionBatchDto dto, CancellationToken cancellationToken = default)
    {
        var batch = await _dbContext.Set<ProductionBatch>()
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

        if (batch is null) return null;

        // Only allow updates if batch is still planned
        if (batch.Status != BatchStatus.Planned) return null;

        batch.PlannedQuantity = dto.PlannedQuantity;
        batch.PlannedDate = dto.PlannedDate;
        batch.Notes = dto.Notes;
        batch.UpdatedAt = DateTime.UtcNow;

        // Recalculate planned consumption
        var existingConsumptions = await _dbContext.Set<BatchIngredientConsumption>()
            .Where(c => c.ProductionBatchId == id)
            .ToListAsync(cancellationToken);

        _dbContext.Set<BatchIngredientConsumption>().RemoveRange(existingConsumptions);

        var plannedConsumption = await CalculatePlannedConsumptionAsync(batch.RecipeVersionId, dto.PlannedQuantity, cancellationToken);

        foreach (var consumption in plannedConsumption)
        {
            var entity = new BatchIngredientConsumption
            {
                ProductionBatchId = batch.Id,
                IngredientId = consumption.IngredientId,
                PlannedQuantity = consumption.PlannedQuantity,
                ActualQuantity = 0,
                Unit = consumption.Unit,
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.Set<BatchIngredientConsumption>().Add(entity);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return (await GetBatchByIdAsync(id, cancellationToken))!;
    }

    public async Task<bool> DeleteBatchAsync(int id, CancellationToken cancellationToken = default)
    {
        var batch = await _dbContext.Set<ProductionBatch>()
            .Include(b => b.IngredientConsumptions)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

        if (batch is null) return false;

        // Only allow deleting planned batches
        if (batch.Status != BatchStatus.Planned) return false;

        _dbContext.Set<BatchIngredientConsumption>().RemoveRange(batch.IngredientConsumptions);
        _dbContext.Set<ProductionBatch>().Remove(batch);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    #endregion

    #region Batch Operations

    public async Task<ProductionBatchDetailDto?> StartBatchAsync(int id, StartProductionDto dto, CancellationToken cancellationToken = default)
    {
        var batch = await _dbContext.Set<ProductionBatch>()
            .Include(b => b.IngredientConsumptions)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

        if (batch is null) return null;
        if (batch.Status != BatchStatus.Planned) return null;

        batch.Status = BatchStatus.InProgress;
        batch.StartedAt = DateTime.UtcNow;
        batch.UpdatedAt = DateTime.UtcNow;

        // Update planned consumptions if provided
        if (dto.IngredientConsumptions.Any())
        {
            foreach (var consumptionDto in dto.IngredientConsumptions)
            {
                var existing = batch.IngredientConsumptions
                    .FirstOrDefault(c => c.IngredientId == consumptionDto.IngredientId);

                if (existing != null)
                {
                    existing.PlannedQuantity = consumptionDto.PlannedQuantity;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return (await GetBatchDetailByIdAsync(id, cancellationToken))!;
    }

    public async Task<ProductionBatchDetailDto?> CompleteBatchAsync(int id, CompleteProductionDto dto, int userId, CancellationToken cancellationToken = default)
    {
        var batch = await _dbContext.Set<ProductionBatch>()
            .Include(b => b.IngredientConsumptions)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

        if (batch is null) return null;
        if (batch.Status != BatchStatus.InProgress) return null;

        batch.Status = BatchStatus.Completed;
        batch.ActualQuantity = dto.ActualQuantity;
        batch.CompletedAt = DateTime.UtcNow;
        batch.UpdatedAt = DateTime.UtcNow;

        // Update actual consumptions
        foreach (var consumptionDto in dto.IngredientConsumptions)
        {
            var existing = batch.IngredientConsumptions
                .FirstOrDefault(c => c.IngredientId == consumptionDto.IngredientId);

            if (existing != null)
            {
                existing.ActualQuantity = consumptionDto.ActualQuantity;
                existing.UpdatedAt = DateTime.UtcNow;

                // Deduct from stock
                await DeductFromStockAsync(batch.BranchId, consumptionDto.IngredientId, consumptionDto.ActualQuantity, consumptionDto.Unit, batch.Id, cancellationToken);
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        // Add finished product to ProductStock
        // Calculate unit cost based on ingredient costs (simplified: use exchange rate for now)
        var exchangeRate = await GetCurrentExchangeRateAsync(cancellationToken);
        var unitCostTjs = 0m; // Cost calculation would require ingredient prices
        var unitCostUsd = unitCostTjs / (exchangeRate > 0 ? exchangeRate : 1);

        await _productStockService.AddFromProductionAsync(
            batch.BranchId,
            batch.RecipeId,
            batch.Id,
            (int)dto.ActualQuantity,
            unitCostUsd,
            unitCostTjs,
            exchangeRate,
            batch.CompletedAt ?? DateTime.UtcNow,
            batch.CompletedAt?.AddDays(30), // Default 30 days expiry
            userId
        );

        return (await GetBatchDetailByIdAsync(id, cancellationToken))!;
    }

    private async Task<decimal> GetCurrentExchangeRateAsync(CancellationToken cancellationToken)
    {
        var rate = await _dbContext.Set<ExchangeRate>()
            .OrderByDescending(r => r.RateDate)
            .FirstOrDefaultAsync(cancellationToken);

        return rate?.Rate ?? 10.9m; // Default rate if none found
    }

    public async Task<bool> CancelBatchAsync(int id, CancellationToken cancellationToken = default)
    {
        var batch = await _dbContext.Set<ProductionBatch>()
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

        if (batch is null) return false;
        if (batch.Status == BatchStatus.Completed) return false;

        batch.Status = BatchStatus.Cancelled;
        batch.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    #endregion

    #region Summary

    public async Task<IEnumerable<ProductionSummaryDto>> GetSummaryAsync(DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default)
    {
        var branches = await _dbContext.Set<Branch>()
            .Where(b => b.Status == BranchStatus.Active)
            .ToListAsync(cancellationToken);

        var query = _dbContext.Set<ProductionBatch>().AsQueryable();

        if (from.HasValue)
            query = query.Where(b => b.PlannedDate >= from.Value);

        if (to.HasValue)
            query = query.Where(b => b.PlannedDate <= to.Value);

        var batches = await query.ToListAsync(cancellationToken);

        return branches.Select(branch => new ProductionSummaryDto
        {
            BranchId = branch.Id,
            BranchName = branch.Name,
            TotalBatches = batches.Count(b => b.BranchId == branch.Id),
            PlannedBatches = batches.Count(b => b.BranchId == branch.Id && b.Status == BatchStatus.Planned),
            InProgressBatches = batches.Count(b => b.BranchId == branch.Id && b.Status == BatchStatus.InProgress),
            CompletedBatches = batches.Count(b => b.BranchId == branch.Id && b.Status == BatchStatus.Completed),
            TotalProducedVolume = batches
                .Where(b => b.BranchId == branch.Id && b.Status == BatchStatus.Completed)
                .Sum(b => b.ActualQuantity)
        });
    }

    #endregion

    #region Helpers

    public async Task<List<BatchIngredientConsumptionInputDto>> CalculatePlannedConsumptionAsync(int recipeVersionId, decimal plannedQuantity, CancellationToken cancellationToken = default)
    {
        var recipeVersion = await _dbContext.Set<RecipeVersion>()
            .Include(v => v.Recipe)
            .Include(v => v.Ingredients)
                .ThenInclude(i => i.Ingredient)
            .Include(v => v.Packaging)
                .ThenInclude(p => p.Ingredient)
            .FirstOrDefaultAsync(v => v.Id == recipeVersionId, cancellationToken);

        if (recipeVersion?.Recipe is null)
            return new List<BatchIngredientConsumptionInputDto>();

        // Calculate ratio based on recipe output
        var ratio = plannedQuantity / recipeVersion.Recipe.OutputVolume;

        var result = new List<BatchIngredientConsumptionInputDto>();

        // Add ingredients
        foreach (var ingredient in recipeVersion.Ingredients)
        {
            result.Add(new BatchIngredientConsumptionInputDto
            {
                IngredientId = ingredient.IngredientId,
                PlannedQuantity = ingredient.Quantity * ratio,
                ActualQuantity = 0,
                Unit = ingredient.Unit
            });
        }

        // Add packaging
        foreach (var packaging in recipeVersion.Packaging)
        {
            result.Add(new BatchIngredientConsumptionInputDto
            {
                IngredientId = packaging.IngredientId,
                PlannedQuantity = packaging.Quantity * ratio,
                ActualQuantity = 0,
                Unit = packaging.Unit
            });
        }

        return result;
    }

    #endregion

    #region Private Methods

    private async Task DeductFromStockAsync(int branchId, int ingredientId, decimal quantity, BaseUnit unit, int batchId, CancellationToken cancellationToken)
    {
        var stock = await _dbContext.Set<IngredientStock>()
            .FirstOrDefaultAsync(s => s.BranchId == branchId && s.IngredientId == ingredientId, cancellationToken);

        if (stock != null)
        {
            stock.Quantity -= quantity;
            stock.LastMovementAt = DateTime.UtcNow;
            stock.UpdatedAt = DateTime.UtcNow;

            // Create movement record
            var movement = new IngredientMovement
            {
                BranchId = branchId,
                IngredientId = ingredientId,
                MovementType = MovementType.Production,
                Quantity = -quantity,
                Unit = unit,
                BalanceAfter = stock.Quantity,
                ReferenceId = batchId,
                ReferenceType = "ProductionBatch",
                MovementDate = DateTime.UtcNow,
                Notes = $"Production batch consumption",
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Set<IngredientMovement>().Add(movement);
        }
    }

    private static ProductionBatchDto MapToDto(ProductionBatch entity)
    {
        return new ProductionBatchDto
        {
            Id = entity.Id,
            BatchNumber = entity.BatchNumber,
            RecipeId = entity.RecipeId,
            RecipeName = entity.Recipe?.Name ?? string.Empty,
            RecipeVersionId = entity.RecipeVersionId,
            RecipeVersionNumber = entity.RecipeVersion?.VersionNumber ?? 0,
            BranchId = entity.BranchId,
            BranchName = entity.Branch?.Name ?? string.Empty,
            PlannedQuantity = entity.PlannedQuantity,
            ActualQuantity = entity.ActualQuantity,
            OutputUnit = entity.OutputUnit,
            PlannedDate = entity.PlannedDate,
            StartedAt = entity.StartedAt,
            CompletedAt = entity.CompletedAt,
            Status = entity.Status,
            CreatedByUserId = entity.CreatedByUserId,
            CreatedByUserLogin = entity.CreatedByUser?.Login,
            Notes = entity.Notes,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    private static ProductionBatchDetailDto MapToDetailDto(ProductionBatch entity)
    {
        return new ProductionBatchDetailDto
        {
            Id = entity.Id,
            BatchNumber = entity.BatchNumber,
            RecipeId = entity.RecipeId,
            RecipeName = entity.Recipe?.Name ?? string.Empty,
            RecipeVersionId = entity.RecipeVersionId,
            RecipeVersionNumber = entity.RecipeVersion?.VersionNumber ?? 0,
            BranchId = entity.BranchId,
            BranchName = entity.Branch?.Name ?? string.Empty,
            PlannedQuantity = entity.PlannedQuantity,
            ActualQuantity = entity.ActualQuantity,
            OutputUnit = entity.OutputUnit,
            PlannedDate = entity.PlannedDate,
            StartedAt = entity.StartedAt,
            CompletedAt = entity.CompletedAt,
            Status = entity.Status,
            CreatedByUserId = entity.CreatedByUserId,
            CreatedByUserLogin = entity.CreatedByUser?.Login,
            Notes = entity.Notes,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IngredientConsumptions = entity.IngredientConsumptions
                .Select(MapConsumptionToDto)
                .ToList()
        };
    }

    private static BatchIngredientConsumptionDto MapConsumptionToDto(BatchIngredientConsumption entity)
    {
        return new BatchIngredientConsumptionDto
        {
            Id = entity.Id,
            ProductionBatchId = entity.ProductionBatchId,
            IngredientId = entity.IngredientId,
            IngredientName = entity.Ingredient?.Name ?? string.Empty,
            PlannedQuantity = entity.PlannedQuantity,
            ActualQuantity = entity.ActualQuantity,
            Unit = entity.Unit
        };
    }

    #endregion
}
