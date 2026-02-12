using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Services;

public class InventoryService : IInventoryService
{
    private readonly DbContext _context;

    public InventoryService(DbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<InventoryDto>> GetInventoriesAsync(int? branchId = null, InventoryType? type = null, InventoryStatus? status = null)
    {
        var query = _context.Set<Inventory>()
            .Include(i => i.Branch)
            .Include(i => i.StartedByUser)
            .Include(i => i.CompletedByUser)
            .Include(i => i.Items)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(i => i.BranchId == branchId.Value);

        if (type.HasValue)
            query = query.Where(i => i.InventoryType == type.Value);

        if (status.HasValue)
            query = query.Where(i => i.Status == status.Value);

        var inventories = await query
            .OrderByDescending(i => i.InventoryDate)
            .ThenByDescending(i => i.CreatedAt)
            .ToListAsync();

        return inventories.Select(MapToDto);
    }

    public async Task<InventoryDto?> GetInventoryByIdAsync(int id)
    {
        var inventory = await _context.Set<Inventory>()
            .Include(i => i.Branch)
            .Include(i => i.StartedByUser)
            .Include(i => i.CompletedByUser)
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id);

        return inventory is null ? null : MapToDto(inventory);
    }

    public async Task<InventoryDetailDto?> GetInventoryDetailAsync(int id)
    {
        var inventory = await _context.Set<Inventory>()
            .Include(i => i.Branch)
            .Include(i => i.StartedByUser)
            .Include(i => i.CompletedByUser)
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (inventory is null) return null;

        var detailDto = MapToDetailDto(inventory);

        // Load item names
        foreach (var item in detailDto.Items)
        {
            if (item.ItemType == InventoryItemType.Ingredient)
            {
                var ingredient = await _context.Set<Ingredient>().FindAsync(item.ItemId);
                item.ItemName = ingredient?.Name ?? "Неизвестно";
                item.Unit = ingredient?.BaseUnit.ToString();
            }
            else
            {
                var recipe = await _context.Set<Recipe>().FindAsync(item.ItemId);
                item.ItemName = recipe?.ProductName ?? "Неизвестно";
                item.Unit = "шт";
            }
        }

        return detailDto;
    }

    public async Task<InventoryDetailDto> CreateInventoryAsync(CreateInventoryDto dto, int userId)
    {
        var branch = await _context.Set<Branch>().FindAsync(dto.BranchId);
        if (branch is null)
            throw new InvalidOperationException("Филиал не найден");

        var inventoryNumber = await GenerateInventoryNumberAsync(branch.Code);

        var inventory = new Inventory
        {
            InventoryNumber = inventoryNumber,
            InventoryDate = dto.InventoryDate.Date,
            BranchId = dto.BranchId,
            InventoryType = dto.InventoryType,
            Status = InventoryStatus.Draft,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<Inventory>().Add(inventory);
        await _context.SaveChangesAsync();

        // Load items from current stock
        var itemType = dto.InventoryType == InventoryType.RawMaterials
            ? InventoryItemType.Ingredient
            : InventoryItemType.Product;

        if (dto.InventoryType == InventoryType.RawMaterials)
        {
            var stocks = await _context.Set<IngredientStock>()
                .Where(s => s.BranchId == dto.BranchId && s.Quantity > 0)
                .ToListAsync();

            foreach (var stock in stocks)
            {
                var item = new InventoryItem
                {
                    InventoryId = inventory.Id,
                    ItemId = stock.IngredientId,
                    ItemType = itemType,
                    ExpectedQuantity = stock.Quantity
                };
                _context.Set<InventoryItem>().Add(item);
            }
        }
        else
        {
            var stocks = await _context.Set<ProductStock>()
                .Where(s => s.BranchId == dto.BranchId && s.Quantity > 0)
                .ToListAsync();

            // Group by RecipeId in case there are multiple batches
            var groupedStocks = stocks.GroupBy(s => s.RecipeId)
                .Select(g => new { RecipeId = g.Key, TotalQuantity = g.Sum(s => s.Quantity) });

            foreach (var stock in groupedStocks)
            {
                var item = new InventoryItem
                {
                    InventoryId = inventory.Id,
                    ItemId = stock.RecipeId,
                    ItemType = itemType,
                    ExpectedQuantity = stock.TotalQuantity
                };
                _context.Set<InventoryItem>().Add(item);
            }
        }

        await _context.SaveChangesAsync();

        return (await GetInventoryDetailAsync(inventory.Id))!;
    }

    public async Task<InventoryDto?> StartInventoryAsync(int id, int userId)
    {
        var inventory = await _context.Set<Inventory>().FindAsync(id);
        if (inventory is null) return null;

        if (inventory.Status != InventoryStatus.Draft)
            throw new InvalidOperationException("Инвентаризацию можно начать только из статуса 'Черновик'");

        inventory.Status = InventoryStatus.InProgress;
        inventory.StartedAt = DateTime.UtcNow;
        inventory.StartedByUserId = userId;

        await _context.SaveChangesAsync();

        return await GetInventoryByIdAsync(id);
    }

    public async Task<InventoryDto?> CompleteInventoryAsync(int id, CompleteInventoryDto dto, int userId)
    {
        var inventory = await _context.Set<Inventory>()
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (inventory is null) return null;

        if (inventory.Status != InventoryStatus.InProgress)
            throw new InvalidOperationException("Завершить можно только инвентаризацию в статусе 'В процессе'");

        // Update items with actual quantities
        foreach (var itemDto in dto.Items)
        {
            var item = inventory.Items.FirstOrDefault(i => i.ItemId == itemDto.ItemId);
            if (item is null) continue;

            item.ActualQuantity = itemDto.ActualQuantity;
            item.Discrepancy = item.ExpectedQuantity - itemDto.ActualQuantity;
            item.Notes = itemDto.Notes;

            // Apply adjustments if there's a discrepancy
            if (item.Discrepancy != 0)
            {
                await ApplyAdjustmentAsync(inventory, item, userId);
            }
        }

        inventory.Status = InventoryStatus.Completed;
        inventory.CompletedAt = DateTime.UtcNow;
        inventory.CompletedByUserId = userId;

        await _context.SaveChangesAsync();

        return await GetInventoryByIdAsync(id);
    }

    public async Task<InventoryDto?> CancelInventoryAsync(int id)
    {
        var inventory = await _context.Set<Inventory>().FindAsync(id);
        if (inventory is null) return null;

        if (inventory.Status == InventoryStatus.Completed)
            throw new InvalidOperationException("Нельзя отменить завершённую инвентаризацию");

        inventory.Status = InventoryStatus.Cancelled;
        await _context.SaveChangesAsync();

        return await GetInventoryByIdAsync(id);
    }

    public async Task<bool> DeleteInventoryAsync(int id)
    {
        var inventory = await _context.Set<Inventory>()
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (inventory is null) return false;

        if (inventory.Status == InventoryStatus.Completed)
            throw new InvalidOperationException("Нельзя удалить завершённую инвентаризацию");

        _context.Set<InventoryItem>().RemoveRange(inventory.Items);
        _context.Set<Inventory>().Remove(inventory);
        await _context.SaveChangesAsync();

        return true;
    }

    #region Private Methods

    private async Task<string> GenerateInventoryNumberAsync(string branchCode)
    {
        var today = DateTime.UtcNow.Date;
        var prefix = $"ИНВ-{branchCode}-{today:yyyyMMdd}";

        var lastInventory = await _context.Set<Inventory>()
            .Where(i => i.InventoryNumber.StartsWith(prefix))
            .OrderByDescending(i => i.InventoryNumber)
            .FirstOrDefaultAsync();

        int sequence = 1;
        if (lastInventory != null)
        {
            var parts = lastInventory.InventoryNumber.Split('-');
            if (parts.Length == 4 && int.TryParse(parts[3], out var lastSeq))
            {
                sequence = lastSeq + 1;
            }
        }

        return $"{prefix}-{sequence:D3}";
    }

    private async Task ApplyAdjustmentAsync(Inventory inventory, InventoryItem item, int userId)
    {
        if (item.Discrepancy == 0 || item.ActualQuantity is null) return;

        var adjustmentQuantity = -item.Discrepancy.Value; // Positive if actual > expected, negative if actual < expected

        if (item.ItemType == InventoryItemType.Ingredient)
        {
            var stock = await _context.Set<IngredientStock>()
                .Include(s => s.Ingredient)
                .FirstOrDefaultAsync(s => s.BranchId == inventory.BranchId && s.IngredientId == item.ItemId);

            if (stock != null)
            {
                stock.Quantity = item.ActualQuantity.Value;
                stock.LastMovementAt = DateTime.UtcNow;

                // Record movement
                var movement = new IngredientMovement
                {
                    MovementDate = DateTime.UtcNow,
                    IngredientId = item.ItemId,
                    BranchId = inventory.BranchId,
                    MovementType = MovementType.Adjustment,
                    Quantity = adjustmentQuantity,
                    Unit = stock.Unit,
                    BalanceAfter = stock.Quantity,
                    ReferenceType = "Inventory",
                    ReferenceId = inventory.Id,
                    CreatedByUserId = userId,
                    Notes = $"Инвентаризация {inventory.InventoryNumber}: корректировка"
                };
                _context.Set<IngredientMovement>().Add(movement);
            }
        }
        else
        {
            var stocks = await _context.Set<ProductStock>()
                .Where(s => s.BranchId == inventory.BranchId && s.RecipeId == item.ItemId)
                .ToListAsync();

            if (stocks.Any())
            {
                var totalExpected = stocks.Sum(s => s.Quantity);
                var adjustmentNeeded = item.ActualQuantity.Value - totalExpected;

                // Apply adjustment to the first stock record (or create if needed)
                var mainStock = stocks.First();
                mainStock.Quantity = Math.Max(0, mainStock.Quantity + (int)adjustmentNeeded);
                mainStock.UpdatedAt = DateTime.UtcNow;

                // Record movement
                var movement = new ProductMovement
                {
                    MovementDate = DateTime.UtcNow.Date,
                    BranchId = inventory.BranchId,
                    RecipeId = item.ItemId,
                    ProductionBatchId = mainStock.ProductionBatchId,
                    OperationType = ProductMovementType.Adjustment,
                    Quantity = (int)adjustmentNeeded,
                    BalanceAfter = mainStock.Quantity,
                    DocumentType = "inventory",
                    DocumentId = inventory.Id,
                    UserId = userId,
                    Notes = $"Инвентаризация {inventory.InventoryNumber}: корректировка",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Set<ProductMovement>().Add(movement);
            }
        }
    }

    private static InventoryDto MapToDto(Inventory inventory)
    {
        return new InventoryDto
        {
            Id = inventory.Id,
            InventoryNumber = inventory.InventoryNumber,
            InventoryDate = inventory.InventoryDate,
            BranchId = inventory.BranchId,
            BranchName = inventory.Branch?.Name ?? string.Empty,
            InventoryType = inventory.InventoryType,
            InventoryTypeName = GetInventoryTypeName(inventory.InventoryType),
            Status = inventory.Status,
            StatusName = GetStatusName(inventory.Status),
            StartedAt = inventory.StartedAt,
            CompletedAt = inventory.CompletedAt,
            StartedByUserId = inventory.StartedByUserId,
            StartedByUserLogin = inventory.StartedByUser?.Login,
            CompletedByUserId = inventory.CompletedByUserId,
            CompletedByUserLogin = inventory.CompletedByUser?.Login,
            Comment = inventory.Comment,
            ItemsCount = inventory.Items.Count,
            ItemsWithDiscrepancy = inventory.Items.Count(i => i.Discrepancy != null && i.Discrepancy != 0),
            CreatedAt = inventory.CreatedAt
        };
    }

    private static InventoryDetailDto MapToDetailDto(Inventory inventory)
    {
        return new InventoryDetailDto
        {
            Id = inventory.Id,
            InventoryNumber = inventory.InventoryNumber,
            InventoryDate = inventory.InventoryDate,
            BranchId = inventory.BranchId,
            BranchName = inventory.Branch?.Name ?? string.Empty,
            InventoryType = inventory.InventoryType,
            InventoryTypeName = GetInventoryTypeName(inventory.InventoryType),
            Status = inventory.Status,
            StatusName = GetStatusName(inventory.Status),
            StartedAt = inventory.StartedAt,
            CompletedAt = inventory.CompletedAt,
            StartedByUserId = inventory.StartedByUserId,
            StartedByUserLogin = inventory.StartedByUser?.Login,
            CompletedByUserId = inventory.CompletedByUserId,
            CompletedByUserLogin = inventory.CompletedByUser?.Login,
            Comment = inventory.Comment,
            ItemsCount = inventory.Items.Count,
            ItemsWithDiscrepancy = inventory.Items.Count(i => i.Discrepancy != null && i.Discrepancy != 0),
            CreatedAt = inventory.CreatedAt,
            Items = inventory.Items.Select(i => new InventoryItemDto
            {
                Id = i.Id,
                InventoryId = i.InventoryId,
                ItemId = i.ItemId,
                ItemType = i.ItemType,
                ItemTypeName = i.ItemType == InventoryItemType.Ingredient ? "Сырьё" : "Продукция",
                ExpectedQuantity = i.ExpectedQuantity,
                ActualQuantity = i.ActualQuantity,
                Discrepancy = i.Discrepancy,
                Notes = i.Notes
            }).ToList()
        };
    }

    private static string GetInventoryTypeName(InventoryType type)
    {
        return type switch
        {
            InventoryType.RawMaterials => "Сырьё и материалы",
            InventoryType.FinishedProducts => "Готовая продукция",
            _ => type.ToString()
        };
    }

    private static string GetStatusName(InventoryStatus status)
    {
        return status switch
        {
            InventoryStatus.Draft => "Черновик",
            InventoryStatus.InProgress => "В процессе",
            InventoryStatus.Completed => "Завершена",
            InventoryStatus.Cancelled => "Отменена",
            _ => status.ToString()
        };
    }

    #endregion
}
