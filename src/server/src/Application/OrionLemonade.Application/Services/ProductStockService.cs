using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Services;

public class ProductStockService : IProductStockService
{
    private readonly DbContext _context;

    public ProductStockService(DbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProductStockDto>> GetStocksAsync(int? branchId = null, int? recipeId = null)
    {
        var query = _context.Set<ProductStock>()
            .Include(s => s.Branch)
            .Include(s => s.Recipe)
            .Include(s => s.ProductionBatch)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(s => s.BranchId == branchId.Value);

        if (recipeId.HasValue)
            query = query.Where(s => s.RecipeId == recipeId.Value);

        var stocks = await query
            .OrderByDescending(s => s.ProductionDate)
            .ToListAsync();

        return stocks.Select(MapToDto);
    }

    public async Task<ProductStockDto?> GetStockByIdAsync(int id)
    {
        var stock = await _context.Set<ProductStock>()
            .Include(s => s.Branch)
            .Include(s => s.Recipe)
            .Include(s => s.ProductionBatch)
            .FirstOrDefaultAsync(s => s.Id == id);

        return stock == null ? null : MapToDto(stock);
    }

    public async Task<IEnumerable<BranchProductStockDto>> GetStockSummaryByBranchAsync()
    {
        var stocks = await _context.Set<ProductStock>()
            .Include(s => s.Branch)
            .Include(s => s.Recipe)
            .Where(s => s.Quantity > 0)
            .ToListAsync();

        var grouped = stocks
            .GroupBy(s => new { s.BranchId, s.Branch.Name })
            .Select(branchGroup => new BranchProductStockDto
            {
                BranchId = branchGroup.Key.BranchId,
                BranchName = branchGroup.Key.Name,
                Products = branchGroup
                    .GroupBy(s => new { s.RecipeId, s.Recipe.Name, s.Recipe.ProductName })
                    .Select(productGroup => new ProductStockSummaryDto
                    {
                        RecipeId = productGroup.Key.RecipeId,
                        RecipeName = productGroup.Key.Name,
                        ProductName = productGroup.Key.ProductName,
                        TotalQuantity = productGroup.Sum(s => s.Quantity),
                        TotalValueUsd = productGroup.Sum(s => s.Quantity * s.UnitCostUsd),
                        TotalValueTjs = productGroup.Sum(s => s.Quantity * s.UnitCostTjs)
                    })
                    .OrderBy(p => p.ProductName)
                    .ToList(),
                TotalQuantity = branchGroup.Sum(s => s.Quantity),
                TotalValueUsd = branchGroup.Sum(s => s.Quantity * s.UnitCostUsd),
                TotalValueTjs = branchGroup.Sum(s => s.Quantity * s.UnitCostTjs)
            })
            .OrderBy(b => b.BranchName)
            .ToList();

        return grouped;
    }

    public async Task<int> GetTotalQuantityAsync(int branchId, int recipeId)
    {
        return await _context.Set<ProductStock>()
            .Where(s => s.BranchId == branchId && s.RecipeId == recipeId)
            .SumAsync(s => s.Quantity);
    }

    public async Task<ProductStockDto> AddStockAsync(CreateProductStockDto dto, int userId)
    {
        var stock = new ProductStock
        {
            BranchId = dto.BranchId,
            RecipeId = dto.RecipeId,
            ProductionBatchId = dto.ProductionBatchId,
            ProductionDate = dto.ProductionDate,
            ExpiryDate = dto.ExpiryDate,
            Quantity = dto.Quantity,
            UnitCostUsd = dto.UnitCostUsd,
            UnitCostTjs = dto.UnitCostTjs,
            ExchangeRate = dto.ExchangeRate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Set<ProductStock>().Add(stock);
        await _context.SaveChangesAsync();

        // Record movement
        var currentBalance = await GetTotalQuantityAsync(dto.BranchId, dto.RecipeId);
        await RecordMovementAsync(new ProductMovement
        {
            MovementDate = DateTime.UtcNow,
            BranchId = dto.BranchId,
            RecipeId = dto.RecipeId,
            ProductionBatchId = dto.ProductionBatchId,
            OperationType = ProductMovementType.Production,
            Quantity = dto.Quantity,
            BalanceAfter = currentBalance,
            UserId = userId,
            Notes = "Stock added manually"
        });

        return await GetStockByIdAsync(stock.Id) ?? MapToDto(stock);
    }

    public async Task<ProductStockDto> AdjustStockAsync(int branchId, int recipeId, AdjustProductStockDto dto, int userId)
    {
        // Find existing stock record or create one
        var stock = await _context.Set<ProductStock>()
            .Where(s => s.BranchId == branchId && s.RecipeId == recipeId && s.Quantity > 0)
            .OrderBy(s => s.ProductionDate)
            .FirstOrDefaultAsync();

        if (stock == null)
        {
            throw new InvalidOperationException($"No stock found for recipe {recipeId} in branch {branchId}");
        }

        var oldQuantity = stock.Quantity;
        stock.Quantity = dto.Quantity;
        stock.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Record adjustment movement
        var currentBalance = await GetTotalQuantityAsync(branchId, recipeId);
        await RecordMovementAsync(new ProductMovement
        {
            MovementDate = DateTime.UtcNow,
            BranchId = branchId,
            RecipeId = recipeId,
            OperationType = ProductMovementType.Adjustment,
            Quantity = dto.Quantity - oldQuantity,
            BalanceAfter = currentBalance,
            UserId = userId,
            Notes = dto.Notes ?? "Stock adjustment"
        });

        return await GetStockByIdAsync(stock.Id) ?? MapToDto(stock);
    }

    public async Task<IEnumerable<ProductMovementDto>> GetMovementsAsync(int? branchId = null, int? recipeId = null, DateTime? from = null, DateTime? to = null)
    {
        var query = _context.Set<ProductMovement>()
            .Include(m => m.Branch)
            .Include(m => m.Recipe)
            .Include(m => m.ProductionBatch)
            .Include(m => m.User)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(m => m.BranchId == branchId.Value);

        if (recipeId.HasValue)
            query = query.Where(m => m.RecipeId == recipeId.Value);

        if (from.HasValue)
            query = query.Where(m => m.MovementDate >= from.Value);

        if (to.HasValue)
            query = query.Where(m => m.MovementDate <= to.Value);

        var movements = await query
            .OrderByDescending(m => m.MovementDate)
            .ThenByDescending(m => m.Id)
            .ToListAsync();

        return movements.Select(MapMovementToDto);
    }

    public async Task<ProductMovementDto?> GetMovementByIdAsync(int id)
    {
        var movement = await _context.Set<ProductMovement>()
            .Include(m => m.Branch)
            .Include(m => m.Recipe)
            .Include(m => m.ProductionBatch)
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.Id == id);

        return movement == null ? null : MapMovementToDto(movement);
    }

    public async Task<ProductMovementDto> RecordSaleAsync(SellProductDto dto, int userId)
    {
        await DeductStockAsync(dto.BranchId, dto.RecipeId, dto.Quantity);

        var currentBalance = await GetTotalQuantityAsync(dto.BranchId, dto.RecipeId);

        var movement = new ProductMovement
        {
            MovementDate = DateTime.UtcNow,
            BranchId = dto.BranchId,
            RecipeId = dto.RecipeId,
            OperationType = ProductMovementType.Sale,
            Quantity = -dto.Quantity,
            BalanceAfter = currentBalance,
            DocumentType = dto.DocumentType,
            DocumentId = dto.DocumentId,
            UserId = userId,
            Notes = dto.Notes
        };

        _context.Set<ProductMovement>().Add(movement);
        await _context.SaveChangesAsync();

        return await GetMovementByIdAsync(movement.Id) ?? MapMovementToDto(movement);
    }

    public async Task<ProductMovementDto> RecordWriteOffAsync(WriteOffProductDto dto, int userId)
    {
        await DeductStockAsync(dto.BranchId, dto.RecipeId, dto.Quantity);

        var currentBalance = await GetTotalQuantityAsync(dto.BranchId, dto.RecipeId);

        var movement = new ProductMovement
        {
            MovementDate = DateTime.UtcNow,
            BranchId = dto.BranchId,
            RecipeId = dto.RecipeId,
            OperationType = ProductMovementType.Spoilage,
            Quantity = -dto.Quantity,
            BalanceAfter = currentBalance,
            UserId = userId,
            Notes = $"{dto.Reason}. {dto.Notes}".Trim()
        };

        _context.Set<ProductMovement>().Add(movement);
        await _context.SaveChangesAsync();

        return await GetMovementByIdAsync(movement.Id) ?? MapMovementToDto(movement);
    }

    public async Task TransferAsync(TransferProductDto dto, int userId)
    {
        if (dto.FromBranchId == dto.ToBranchId)
            throw new InvalidOperationException("Cannot transfer to the same branch");

        // Deduct from source
        await DeductStockAsync(dto.FromBranchId, dto.RecipeId, dto.Quantity);

        var sourceBalance = await GetTotalQuantityAsync(dto.FromBranchId, dto.RecipeId);

        // Record transfer out
        var transferOut = new ProductMovement
        {
            MovementDate = DateTime.UtcNow,
            BranchId = dto.FromBranchId,
            RecipeId = dto.RecipeId,
            OperationType = ProductMovementType.TransferOut,
            Quantity = -dto.Quantity,
            BalanceAfter = sourceBalance,
            UserId = userId,
            Notes = $"Transfer to branch {dto.ToBranchId}. {dto.Notes}".Trim()
        };
        _context.Set<ProductMovement>().Add(transferOut);

        // Get stock info for cost calculation
        var sourceStock = await _context.Set<ProductStock>()
            .Where(s => s.BranchId == dto.FromBranchId && s.RecipeId == dto.RecipeId)
            .OrderBy(s => s.ProductionDate)
            .FirstOrDefaultAsync();

        // Add to destination
        var destStock = new ProductStock
        {
            BranchId = dto.ToBranchId,
            RecipeId = dto.RecipeId,
            ProductionDate = sourceStock?.ProductionDate ?? DateTime.UtcNow,
            ExpiryDate = sourceStock?.ExpiryDate,
            Quantity = dto.Quantity,
            UnitCostUsd = sourceStock?.UnitCostUsd ?? 0,
            UnitCostTjs = sourceStock?.UnitCostTjs ?? 0,
            ExchangeRate = sourceStock?.ExchangeRate ?? 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Set<ProductStock>().Add(destStock);
        await _context.SaveChangesAsync();

        var destBalance = await GetTotalQuantityAsync(dto.ToBranchId, dto.RecipeId);

        // Record transfer in
        var transferIn = new ProductMovement
        {
            MovementDate = DateTime.UtcNow,
            BranchId = dto.ToBranchId,
            RecipeId = dto.RecipeId,
            OperationType = ProductMovementType.TransferIn,
            Quantity = dto.Quantity,
            BalanceAfter = destBalance,
            UserId = userId,
            Notes = $"Transfer from branch {dto.FromBranchId}. {dto.Notes}".Trim()
        };
        _context.Set<ProductMovement>().Add(transferIn);

        await _context.SaveChangesAsync();
    }

    public async Task AddFromProductionAsync(int branchId, int recipeId, int productionBatchId, int quantity, decimal unitCostUsd, decimal unitCostTjs, decimal exchangeRate, DateTime productionDate, DateTime? expiryDate, int userId)
    {
        var stock = new ProductStock
        {
            BranchId = branchId,
            RecipeId = recipeId,
            ProductionBatchId = productionBatchId,
            ProductionDate = productionDate,
            ExpiryDate = expiryDate,
            Quantity = quantity,
            UnitCostUsd = unitCostUsd,
            UnitCostTjs = unitCostTjs,
            ExchangeRate = exchangeRate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Set<ProductStock>().Add(stock);
        await _context.SaveChangesAsync();

        var currentBalance = await GetTotalQuantityAsync(branchId, recipeId);

        var movement = new ProductMovement
        {
            MovementDate = DateTime.UtcNow,
            BranchId = branchId,
            RecipeId = recipeId,
            ProductionBatchId = productionBatchId,
            OperationType = ProductMovementType.Production,
            Quantity = quantity,
            BalanceAfter = currentBalance,
            DocumentType = "ProductionBatch",
            DocumentId = productionBatchId,
            UserId = userId,
            Notes = "From production batch completion"
        };

        _context.Set<ProductMovement>().Add(movement);
        await _context.SaveChangesAsync();
    }

    private async Task DeductStockAsync(int branchId, int recipeId, int quantity)
    {
        var stocks = await _context.Set<ProductStock>()
            .Where(s => s.BranchId == branchId && s.RecipeId == recipeId && s.Quantity > 0)
            .OrderBy(s => s.ProductionDate) // FIFO - oldest first
            .ToListAsync();

        var totalAvailable = stocks.Sum(s => s.Quantity);
        if (totalAvailable < quantity)
        {
            throw new InvalidOperationException($"Insufficient stock. Available: {totalAvailable}, Requested: {quantity}");
        }

        var remaining = quantity;
        foreach (var stock in stocks)
        {
            if (remaining <= 0) break;

            if (stock.Quantity <= remaining)
            {
                remaining -= stock.Quantity;
                stock.Quantity = 0;
            }
            else
            {
                stock.Quantity -= remaining;
                remaining = 0;
            }
            stock.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    private async Task RecordMovementAsync(ProductMovement movement)
    {
        _context.Set<ProductMovement>().Add(movement);
        await _context.SaveChangesAsync();
    }

    private static ProductStockDto MapToDto(ProductStock stock)
    {
        return new ProductStockDto
        {
            Id = stock.Id,
            BranchId = stock.BranchId,
            BranchName = stock.Branch?.Name ?? string.Empty,
            RecipeId = stock.RecipeId,
            RecipeName = stock.Recipe?.Name ?? string.Empty,
            ProductName = stock.Recipe?.ProductName ?? string.Empty,
            ProductionBatchId = stock.ProductionBatchId,
            BatchNumber = stock.ProductionBatch?.BatchNumber,
            ProductionDate = stock.ProductionDate,
            ExpiryDate = stock.ExpiryDate,
            Quantity = stock.Quantity,
            UnitCostUsd = stock.UnitCostUsd,
            UnitCostTjs = stock.UnitCostTjs,
            ExchangeRate = stock.ExchangeRate,
            CreatedAt = stock.CreatedAt,
            UpdatedAt = stock.UpdatedAt
        };
    }

    private static ProductMovementDto MapMovementToDto(ProductMovement movement)
    {
        return new ProductMovementDto
        {
            Id = movement.Id,
            MovementDate = movement.MovementDate,
            BranchId = movement.BranchId,
            BranchName = movement.Branch?.Name ?? string.Empty,
            RecipeId = movement.RecipeId,
            RecipeName = movement.Recipe?.Name ?? string.Empty,
            ProductName = movement.Recipe?.ProductName ?? string.Empty,
            ProductionBatchId = movement.ProductionBatchId,
            BatchNumber = movement.ProductionBatch?.BatchNumber,
            OperationType = movement.OperationType,
            OperationTypeName = GetOperationTypeName(movement.OperationType),
            Quantity = movement.Quantity,
            BalanceAfter = movement.BalanceAfter,
            DocumentType = movement.DocumentType,
            DocumentId = movement.DocumentId,
            UserId = movement.UserId,
            UserName = movement.User?.Login,
            Notes = movement.Notes,
            CreatedAt = movement.CreatedAt
        };
    }

    private static string GetOperationTypeName(ProductMovementType type)
    {
        return type switch
        {
            ProductMovementType.Production => "Производство",
            ProductMovementType.Sale => "Продажа",
            ProductMovementType.Spoilage => "Списание",
            ProductMovementType.Return => "Возврат",
            ProductMovementType.TransferOut => "Перемещение (исход)",
            ProductMovementType.TransferIn => "Перемещение (приход)",
            ProductMovementType.Adjustment => "Корректировка",
            _ => type.ToString()
        };
    }
}
