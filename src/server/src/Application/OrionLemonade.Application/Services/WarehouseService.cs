using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Services;

public class WarehouseService : IWarehouseService
{
    private readonly DbContext _dbContext;

    public WarehouseService(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    #region Stock

    public async Task<IEnumerable<IngredientStockDto>> GetStockByBranchAsync(int branchId, CancellationToken cancellationToken = default)
    {
        var stocks = await _dbContext.Set<IngredientStock>()
            .Include(s => s.Branch)
            .Include(s => s.Ingredient)
            .Where(s => s.BranchId == branchId)
            .OrderBy(s => s.Ingredient!.Category)
            .ThenBy(s => s.Ingredient!.Name)
            .ToListAsync(cancellationToken);

        return stocks.Select(MapStockToDto);
    }

    public async Task<IEnumerable<IngredientStockDto>> GetAllStockAsync(CancellationToken cancellationToken = default)
    {
        var stocks = await _dbContext.Set<IngredientStock>()
            .Include(s => s.Branch)
            .Include(s => s.Ingredient)
            .OrderBy(s => s.Branch!.Name)
            .ThenBy(s => s.Ingredient!.Category)
            .ThenBy(s => s.Ingredient!.Name)
            .ToListAsync(cancellationToken);

        return stocks.Select(MapStockToDto);
    }

    public async Task<IEnumerable<IngredientStockDto>> GetLowStockAsync(int? branchId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<IngredientStock>()
            .Include(s => s.Branch)
            .Include(s => s.Ingredient)
            .Where(s => s.Ingredient!.MinStock != null && s.Quantity <= s.Ingredient.MinStock);

        if (branchId.HasValue)
            query = query.Where(s => s.BranchId == branchId.Value);

        var stocks = await query
            .OrderBy(s => s.Quantity)
            .ToListAsync(cancellationToken);

        return stocks.Select(MapStockToDto);
    }

    public async Task<IngredientStockDto?> GetStockAsync(int branchId, int ingredientId, CancellationToken cancellationToken = default)
    {
        var stock = await _dbContext.Set<IngredientStock>()
            .Include(s => s.Branch)
            .Include(s => s.Ingredient)
            .FirstOrDefaultAsync(s => s.BranchId == branchId && s.IngredientId == ingredientId, cancellationToken);

        return stock is null ? null : MapStockToDto(stock);
    }

    public async Task<IEnumerable<IngredientStockSummaryDto>> GetStockSummaryAsync(CancellationToken cancellationToken = default)
    {
        var branches = await _dbContext.Set<Branch>()
            .Where(b => b.Status == BranchStatus.Active)
            .ToListAsync(cancellationToken);

        var stocks = await _dbContext.Set<IngredientStock>()
            .Include(s => s.Ingredient)
            .ToListAsync(cancellationToken);

        return branches.Select(b => new IngredientStockSummaryDto
        {
            BranchId = b.Id,
            BranchName = b.Name,
            TotalItems = stocks.Count(s => s.BranchId == b.Id && s.Quantity > 0),
            LowStockItems = stocks.Count(s => s.BranchId == b.Id && s.Ingredient?.MinStock != null && s.Quantity > 0 && s.Quantity <= s.Ingredient.MinStock),
            OutOfStockItems = stocks.Count(s => s.BranchId == b.Id && s.Quantity <= 0)
        });
    }

    #endregion

    #region Receipts

    public async Task<IEnumerable<IngredientReceiptDto>> GetReceiptsAsync(int? branchId = null, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<IngredientReceipt>()
            .Include(r => r.Branch)
            .Include(r => r.Ingredient)
            .Include(r => r.Supplier)
            .Include(r => r.CreatedByUser)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(r => r.BranchId == branchId.Value);

        if (from.HasValue)
            query = query.Where(r => r.ReceiptDate >= from.Value);

        if (to.HasValue)
            query = query.Where(r => r.ReceiptDate <= to.Value);

        var receipts = await query
            .OrderByDescending(r => r.ReceiptDate)
            .ThenByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);

        return receipts.Select(MapReceiptToDto);
    }

    public async Task<IngredientReceiptDto?> GetReceiptByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var receipt = await _dbContext.Set<IngredientReceipt>()
            .Include(r => r.Branch)
            .Include(r => r.Ingredient)
            .Include(r => r.Supplier)
            .Include(r => r.CreatedByUser)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        return receipt is null ? null : MapReceiptToDto(receipt);
    }

    public async Task<IngredientReceiptDto> CreateReceiptAsync(CreateIngredientReceiptDto dto, int userId, CancellationToken cancellationToken = default)
    {
        var receipt = new IngredientReceipt
        {
            BranchId = dto.BranchId,
            IngredientId = dto.IngredientId,
            SupplierId = dto.SupplierId,
            Quantity = dto.Quantity,
            Unit = dto.Unit,
            UnitPrice = dto.UnitPrice,
            TotalPrice = dto.Quantity * dto.UnitPrice,
            Currency = dto.Currency,
            ReceiptDate = dto.ReceiptDate,
            DocumentNumber = dto.DocumentNumber,
            Notes = dto.Notes,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<IngredientReceipt>().Add(receipt);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Update stock
        await UpdateStockAsync(dto.BranchId, dto.IngredientId, dto.Quantity, dto.Unit, cancellationToken);

        // Create movement record
        var stock = await _dbContext.Set<IngredientStock>()
            .FirstAsync(s => s.BranchId == dto.BranchId && s.IngredientId == dto.IngredientId, cancellationToken);

        var movement = new IngredientMovement
        {
            BranchId = dto.BranchId,
            IngredientId = dto.IngredientId,
            MovementType = MovementType.Receipt,
            Quantity = dto.Quantity,
            Unit = dto.Unit,
            BalanceAfter = stock.Quantity,
            ReferenceId = receipt.Id,
            ReferenceType = "Receipt",
            MovementDate = dto.ReceiptDate,
            Notes = dto.Notes,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<IngredientMovement>().Add(movement);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return (await GetReceiptByIdAsync(receipt.Id, cancellationToken))!;
    }

    public async Task<bool> DeleteReceiptAsync(int id, CancellationToken cancellationToken = default)
    {
        var receipt = await _dbContext.Set<IngredientReceipt>()
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (receipt is null) return false;

        // Reverse the stock change
        await UpdateStockAsync(receipt.BranchId, receipt.IngredientId, -receipt.Quantity, receipt.Unit, cancellationToken);

        // Delete related movement
        var movement = await _dbContext.Set<IngredientMovement>()
            .FirstOrDefaultAsync(m => m.ReferenceId == id && m.ReferenceType == "Receipt", cancellationToken);

        if (movement != null)
            _dbContext.Set<IngredientMovement>().Remove(movement);

        _dbContext.Set<IngredientReceipt>().Remove(receipt);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    #endregion

    #region Write-offs

    public async Task<IEnumerable<IngredientWriteOffDto>> GetWriteOffsAsync(int? branchId = null, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<IngredientWriteOff>()
            .Include(w => w.Branch)
            .Include(w => w.Ingredient)
            .Include(w => w.CreatedByUser)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(w => w.BranchId == branchId.Value);

        if (from.HasValue)
            query = query.Where(w => w.WriteOffDate >= from.Value);

        if (to.HasValue)
            query = query.Where(w => w.WriteOffDate <= to.Value);

        var writeOffs = await query
            .OrderByDescending(w => w.WriteOffDate)
            .ThenByDescending(w => w.CreatedAt)
            .ToListAsync(cancellationToken);

        return writeOffs.Select(MapWriteOffToDto);
    }

    public async Task<IngredientWriteOffDto?> GetWriteOffByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var writeOff = await _dbContext.Set<IngredientWriteOff>()
            .Include(w => w.Branch)
            .Include(w => w.Ingredient)
            .Include(w => w.CreatedByUser)
            .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);

        return writeOff is null ? null : MapWriteOffToDto(writeOff);
    }

    public async Task<IngredientWriteOffDto> CreateWriteOffAsync(CreateIngredientWriteOffDto dto, int userId, CancellationToken cancellationToken = default)
    {
        var writeOff = new IngredientWriteOff
        {
            BranchId = dto.BranchId,
            IngredientId = dto.IngredientId,
            Quantity = dto.Quantity,
            Unit = dto.Unit,
            Reason = dto.Reason,
            WriteOffDate = dto.WriteOffDate,
            Notes = dto.Notes,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<IngredientWriteOff>().Add(writeOff);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Update stock (subtract)
        await UpdateStockAsync(dto.BranchId, dto.IngredientId, -dto.Quantity, dto.Unit, cancellationToken);

        // Create movement record
        var stock = await _dbContext.Set<IngredientStock>()
            .FirstAsync(s => s.BranchId == dto.BranchId && s.IngredientId == dto.IngredientId, cancellationToken);

        var movement = new IngredientMovement
        {
            BranchId = dto.BranchId,
            IngredientId = dto.IngredientId,
            MovementType = MovementType.WriteOff,
            Quantity = -dto.Quantity,
            Unit = dto.Unit,
            BalanceAfter = stock.Quantity,
            ReferenceId = writeOff.Id,
            ReferenceType = "WriteOff",
            MovementDate = dto.WriteOffDate,
            Notes = dto.Notes,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<IngredientMovement>().Add(movement);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return (await GetWriteOffByIdAsync(writeOff.Id, cancellationToken))!;
    }

    public async Task<bool> DeleteWriteOffAsync(int id, CancellationToken cancellationToken = default)
    {
        var writeOff = await _dbContext.Set<IngredientWriteOff>()
            .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);

        if (writeOff is null) return false;

        // Reverse the stock change (add back)
        await UpdateStockAsync(writeOff.BranchId, writeOff.IngredientId, writeOff.Quantity, writeOff.Unit, cancellationToken);

        // Delete related movement
        var movement = await _dbContext.Set<IngredientMovement>()
            .FirstOrDefaultAsync(m => m.ReferenceId == id && m.ReferenceType == "WriteOff", cancellationToken);

        if (movement != null)
            _dbContext.Set<IngredientMovement>().Remove(movement);

        _dbContext.Set<IngredientWriteOff>().Remove(writeOff);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    #endregion

    #region Movements

    public async Task<IEnumerable<IngredientMovementDto>> GetMovementsAsync(int? branchId = null, int? ingredientId = null, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<IngredientMovement>()
            .Include(m => m.Branch)
            .Include(m => m.Ingredient)
            .Include(m => m.CreatedByUser)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(m => m.BranchId == branchId.Value);

        if (ingredientId.HasValue)
            query = query.Where(m => m.IngredientId == ingredientId.Value);

        if (from.HasValue)
            query = query.Where(m => m.MovementDate >= from.Value);

        if (to.HasValue)
            query = query.Where(m => m.MovementDate <= to.Value);

        var movements = await query
            .OrderByDescending(m => m.MovementDate)
            .ThenByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);

        return movements.Select(MapMovementToDto);
    }

    public async Task<IngredientMovementDto> CreateAdjustmentAsync(CreateAdjustmentDto dto, int userId, CancellationToken cancellationToken = default)
    {
        var stock = await _dbContext.Set<IngredientStock>()
            .FirstOrDefaultAsync(s => s.BranchId == dto.BranchId && s.IngredientId == dto.IngredientId, cancellationToken);

        decimal currentQty = stock?.Quantity ?? 0;
        decimal difference = dto.NewQuantity - currentQty;

        if (stock is null)
        {
            stock = new IngredientStock
            {
                BranchId = dto.BranchId,
                IngredientId = dto.IngredientId,
                Quantity = dto.NewQuantity,
                Unit = dto.Unit,
                LastMovementAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.Set<IngredientStock>().Add(stock);
        }
        else
        {
            stock.Quantity = dto.NewQuantity;
            stock.LastMovementAt = DateTime.UtcNow;
            stock.UpdatedAt = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        var movement = new IngredientMovement
        {
            BranchId = dto.BranchId,
            IngredientId = dto.IngredientId,
            MovementType = MovementType.Adjustment,
            Quantity = difference,
            Unit = dto.Unit,
            BalanceAfter = dto.NewQuantity,
            MovementDate = DateTime.UtcNow,
            Notes = dto.Notes,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<IngredientMovement>().Add(movement);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapMovementToDto(movement);
    }

    #endregion

    #region Private Methods

    private async Task UpdateStockAsync(int branchId, int ingredientId, decimal quantityChange, BaseUnit unit, CancellationToken cancellationToken)
    {
        var stock = await _dbContext.Set<IngredientStock>()
            .FirstOrDefaultAsync(s => s.BranchId == branchId && s.IngredientId == ingredientId, cancellationToken);

        if (stock is null)
        {
            stock = new IngredientStock
            {
                BranchId = branchId,
                IngredientId = ingredientId,
                Quantity = quantityChange,
                Unit = unit,
                LastMovementAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.Set<IngredientStock>().Add(stock);
        }
        else
        {
            stock.Quantity += quantityChange;
            stock.LastMovementAt = DateTime.UtcNow;
            stock.UpdatedAt = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static IngredientStockDto MapStockToDto(IngredientStock entity)
    {
        return new IngredientStockDto
        {
            Id = entity.Id,
            BranchId = entity.BranchId,
            BranchName = entity.Branch?.Name ?? string.Empty,
            IngredientId = entity.IngredientId,
            IngredientName = entity.Ingredient?.Name ?? string.Empty,
            IngredientCategory = entity.Ingredient?.Category ?? IngredientCategory.Raw,
            Quantity = entity.Quantity,
            Unit = entity.Unit,
            MinStock = entity.Ingredient?.MinStock,
            IsLowStock = entity.Ingredient?.MinStock != null && entity.Quantity <= entity.Ingredient.MinStock,
            LastMovementAt = entity.LastMovementAt
        };
    }

    private static IngredientReceiptDto MapReceiptToDto(IngredientReceipt entity)
    {
        return new IngredientReceiptDto
        {
            Id = entity.Id,
            BranchId = entity.BranchId,
            BranchName = entity.Branch?.Name ?? string.Empty,
            IngredientId = entity.IngredientId,
            IngredientName = entity.Ingredient?.Name ?? string.Empty,
            SupplierId = entity.SupplierId,
            SupplierName = entity.Supplier?.Name,
            Quantity = entity.Quantity,
            Unit = entity.Unit,
            UnitPrice = entity.UnitPrice,
            TotalPrice = entity.TotalPrice,
            Currency = entity.Currency,
            ReceiptDate = entity.ReceiptDate,
            DocumentNumber = entity.DocumentNumber,
            Notes = entity.Notes,
            CreatedByUserId = entity.CreatedByUserId,
            CreatedByUserLogin = entity.CreatedByUser?.Login,
            CreatedAt = entity.CreatedAt
        };
    }

    private static IngredientWriteOffDto MapWriteOffToDto(IngredientWriteOff entity)
    {
        return new IngredientWriteOffDto
        {
            Id = entity.Id,
            BranchId = entity.BranchId,
            BranchName = entity.Branch?.Name ?? string.Empty,
            IngredientId = entity.IngredientId,
            IngredientName = entity.Ingredient?.Name ?? string.Empty,
            Quantity = entity.Quantity,
            Unit = entity.Unit,
            Reason = entity.Reason,
            WriteOffDate = entity.WriteOffDate,
            Notes = entity.Notes,
            CreatedByUserId = entity.CreatedByUserId,
            CreatedByUserLogin = entity.CreatedByUser?.Login,
            CreatedAt = entity.CreatedAt
        };
    }

    private static IngredientMovementDto MapMovementToDto(IngredientMovement entity)
    {
        return new IngredientMovementDto
        {
            Id = entity.Id,
            BranchId = entity.BranchId,
            BranchName = entity.Branch?.Name ?? string.Empty,
            IngredientId = entity.IngredientId,
            IngredientName = entity.Ingredient?.Name ?? string.Empty,
            MovementType = entity.MovementType,
            Quantity = entity.Quantity,
            Unit = entity.Unit,
            BalanceAfter = entity.BalanceAfter,
            ReferenceId = entity.ReferenceId,
            ReferenceType = entity.ReferenceType,
            MovementDate = entity.MovementDate,
            Notes = entity.Notes,
            CreatedByUserId = entity.CreatedByUserId,
            CreatedByUserLogin = entity.CreatedByUser?.Login,
            CreatedAt = entity.CreatedAt
        };
    }

    #endregion
}
