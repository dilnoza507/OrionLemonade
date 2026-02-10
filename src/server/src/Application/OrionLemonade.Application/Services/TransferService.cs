using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Services;

public class TransferService : ITransferService
{
    private readonly DbContext _context;

    public TransferService(DbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TransferDto>> GetTransfersAsync(int? branchId = null, TransferType? type = null, TransferStatus? status = null)
    {
        var query = _context.Set<Transfer>()
            .Include(t => t.SenderBranch)
            .Include(t => t.ReceiverBranch)
            .Include(t => t.SentByUser)
            .Include(t => t.ReceivedByUser)
            .Include(t => t.Items)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(t => t.SenderBranchId == branchId.Value || t.ReceiverBranchId == branchId.Value);

        if (type.HasValue)
            query = query.Where(t => t.TransferType == type.Value);

        if (status.HasValue)
            query = query.Where(t => t.Status == status.Value);

        var transfers = await query
            .OrderByDescending(t => t.CreatedDate)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync();

        return transfers.Select(MapToDto);
    }

    public async Task<TransferDto?> GetTransferByIdAsync(int id)
    {
        var transfer = await _context.Set<Transfer>()
            .Include(t => t.SenderBranch)
            .Include(t => t.ReceiverBranch)
            .Include(t => t.SentByUser)
            .Include(t => t.ReceivedByUser)
            .Include(t => t.Items)
            .FirstOrDefaultAsync(t => t.Id == id);

        return transfer is null ? null : MapToDto(transfer);
    }

    public async Task<TransferDetailDto?> GetTransferDetailAsync(int id)
    {
        var transfer = await _context.Set<Transfer>()
            .Include(t => t.SenderBranch)
            .Include(t => t.ReceiverBranch)
            .Include(t => t.SentByUser)
            .Include(t => t.ReceivedByUser)
            .Include(t => t.Items)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transfer is null) return null;

        var detailDto = MapToDetailDto(transfer);

        // Load item names
        foreach (var item in detailDto.Items)
        {
            if (item.ItemType == TransferItemType.Ingredient)
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

    public async Task<TransferDetailDto> CreateTransferAsync(CreateTransferDto dto, int userId)
    {
        if (dto.SenderBranchId == dto.ReceiverBranchId)
            throw new InvalidOperationException("Отправитель и получатель не могут быть одним филиалом");

        var senderBranch = await _context.Set<Branch>().FindAsync(dto.SenderBranchId);
        if (senderBranch is null)
            throw new InvalidOperationException("Филиал-отправитель не найден");

        var receiverBranch = await _context.Set<Branch>().FindAsync(dto.ReceiverBranchId);
        if (receiverBranch is null)
            throw new InvalidOperationException("Филиал-получатель не найден");

        var transferNumber = await GenerateTransferNumberAsync(senderBranch.Code);

        var transfer = new Transfer
        {
            TransferNumber = transferNumber,
            CreatedDate = DateTime.UtcNow.Date,
            SenderBranchId = dto.SenderBranchId,
            ReceiverBranchId = dto.ReceiverBranchId,
            TransferType = dto.TransferType,
            Status = TransferStatus.Created,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<Transfer>().Add(transfer);
        await _context.SaveChangesAsync();

        // Add items
        var itemType = dto.TransferType == TransferType.RawMaterials
            ? TransferItemType.Ingredient
            : TransferItemType.Product;

        foreach (var itemDto in dto.Items)
        {
            var item = new TransferItem
            {
                TransferId = transfer.Id,
                ItemId = itemDto.ItemId,
                ItemType = itemType,
                QuantitySent = itemDto.QuantitySent,
                TransferPriceUsd = itemDto.TransferPriceUsd
            };
            _context.Set<TransferItem>().Add(item);
        }

        await _context.SaveChangesAsync();

        return (await GetTransferDetailAsync(transfer.Id))!;
    }

    public async Task<TransferDto?> SendTransferAsync(int id, int userId)
    {
        var transfer = await _context.Set<Transfer>()
            .Include(t => t.Items)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transfer is null) return null;
        if (transfer.Status != TransferStatus.Created)
            throw new InvalidOperationException("Трансфер уже отправлен или отменён");

        // Deduct from sender's stock
        foreach (var item in transfer.Items)
        {
            if (item.ItemType == TransferItemType.Ingredient)
            {
                await DeductIngredientStockAsync(transfer.SenderBranchId, item.ItemId, item.QuantitySent, transfer.Id, userId);
            }
            else
            {
                await DeductProductStockAsync(transfer.SenderBranchId, item.ItemId, (int)item.QuantitySent, transfer.Id, userId);
            }
        }

        transfer.Status = TransferStatus.InTransit;
        transfer.SentDate = DateTime.UtcNow;
        transfer.SentByUserId = userId;

        await _context.SaveChangesAsync();

        return await GetTransferByIdAsync(id);
    }

    public async Task<TransferDto?> ReceiveTransferAsync(int id, ReceiveTransferDto dto, int userId)
    {
        var transfer = await _context.Set<Transfer>()
            .Include(t => t.Items)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transfer is null) return null;
        if (transfer.Status != TransferStatus.InTransit)
            throw new InvalidOperationException("Трансфер не находится в пути");

        // Update received quantities and add to receiver's stock
        foreach (var itemDto in dto.Items)
        {
            var item = transfer.Items.FirstOrDefault(i => i.ItemId == itemDto.ItemId);
            if (item is null) continue;

            item.QuantityReceived = itemDto.QuantityReceived;
            item.Discrepancy = item.QuantitySent - itemDto.QuantityReceived;

            if (item.ItemType == TransferItemType.Ingredient)
            {
                await AddIngredientStockAsync(transfer.ReceiverBranchId, item.ItemId, itemDto.QuantityReceived, item.TransferPriceUsd, transfer.Id, userId);
            }
            else
            {
                await AddProductStockAsync(transfer.ReceiverBranchId, item.ItemId, (int)itemDto.QuantityReceived, item.TransferPriceUsd, transfer.Id, userId);
            }
        }

        transfer.Status = TransferStatus.Received;
        transfer.ReceivedDate = DateTime.UtcNow;
        transfer.ReceivedByUserId = userId;

        await _context.SaveChangesAsync();

        return await GetTransferByIdAsync(id);
    }

    public async Task<TransferDto?> CancelTransferAsync(int id)
    {
        var transfer = await _context.Set<Transfer>().FindAsync(id);
        if (transfer is null) return null;

        if (transfer.Status != TransferStatus.Created)
            throw new InvalidOperationException("Можно отменить только созданный трансфер");

        transfer.Status = TransferStatus.Cancelled;
        await _context.SaveChangesAsync();

        return await GetTransferByIdAsync(id);
    }

    public async Task<bool> DeleteTransferAsync(int id)
    {
        var transfer = await _context.Set<Transfer>()
            .Include(t => t.Items)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transfer is null) return false;

        if (transfer.Status != TransferStatus.Created && transfer.Status != TransferStatus.Cancelled)
            throw new InvalidOperationException("Можно удалить только созданный или отменённый трансфер");

        _context.Set<TransferItem>().RemoveRange(transfer.Items);
        _context.Set<Transfer>().Remove(transfer);
        await _context.SaveChangesAsync();

        return true;
    }

    #region Private Methods

    private async Task<string> GenerateTransferNumberAsync(string branchCode)
    {
        var today = DateTime.UtcNow.Date;
        var prefix = $"ТР-{branchCode}-{today:yyyyMMdd}";

        var lastTransfer = await _context.Set<Transfer>()
            .Where(t => t.TransferNumber.StartsWith(prefix))
            .OrderByDescending(t => t.TransferNumber)
            .FirstOrDefaultAsync();

        int sequence = 1;
        if (lastTransfer != null)
        {
            var parts = lastTransfer.TransferNumber.Split('-');
            if (parts.Length == 4 && int.TryParse(parts[3], out var lastSeq))
            {
                sequence = lastSeq + 1;
            }
        }

        return $"{prefix}-{sequence:D3}";
    }

    private async Task DeductIngredientStockAsync(int branchId, int ingredientId, decimal quantity, int transferId, int userId)
    {
        var stock = await _context.Set<IngredientStock>()
            .Include(s => s.Ingredient)
            .FirstOrDefaultAsync(s => s.BranchId == branchId && s.IngredientId == ingredientId);

        if (stock is null || stock.Quantity < quantity)
            throw new InvalidOperationException("Недостаточно сырья на складе для трансфера");

        stock.Quantity -= quantity;
        stock.LastMovementAt = DateTime.UtcNow;

        // Record movement
        var movement = new IngredientMovement
        {
            MovementDate = DateTime.UtcNow,
            IngredientId = ingredientId,
            BranchId = branchId,
            MovementType = MovementType.TransferOut,
            Quantity = -quantity,
            Unit = stock.Unit,
            BalanceAfter = stock.Quantity,
            ReferenceType = "Transfer",
            ReferenceId = transferId,
            CreatedByUserId = userId,
            Notes = "Трансфер - отправка"
        };
        _context.Set<IngredientMovement>().Add(movement);
    }

    private async Task DeductProductStockAsync(int branchId, int recipeId, int quantity, int transferId, int userId)
    {
        var stock = await _context.Set<ProductStock>()
            .FirstOrDefaultAsync(s => s.BranchId == branchId && s.RecipeId == recipeId);

        if (stock is null || stock.Quantity < quantity)
            throw new InvalidOperationException("Недостаточно продукции на складе для трансфера");

        stock.Quantity -= quantity;
        stock.UpdatedAt = DateTime.UtcNow;

        // Record movement
        var movement = new ProductMovement
        {
            MovementDate = DateTime.UtcNow.Date,
            BranchId = branchId,
            RecipeId = recipeId,
            ProductionBatchId = stock.ProductionBatchId,
            OperationType = ProductMovementType.TransferOut,
            Quantity = -quantity,
            BalanceAfter = stock.Quantity,
            DocumentType = "transfer",
            DocumentId = transferId,
            UserId = userId,
            Notes = "Трансфер - отправка",
            CreatedAt = DateTime.UtcNow
        };
        _context.Set<ProductMovement>().Add(movement);
    }

    private async Task AddIngredientStockAsync(int branchId, int ingredientId, decimal quantity, decimal priceUsd, int transferId, int userId)
    {
        var ingredient = await _context.Set<Ingredient>().FindAsync(ingredientId);
        var unit = ingredient?.BaseUnit ?? BaseUnit.Kg;

        var stock = await _context.Set<IngredientStock>()
            .FirstOrDefaultAsync(s => s.BranchId == branchId && s.IngredientId == ingredientId);

        if (stock is null)
        {
            stock = new IngredientStock
            {
                BranchId = branchId,
                IngredientId = ingredientId,
                Quantity = quantity,
                Unit = unit,
                LastMovementAt = DateTime.UtcNow
            };
            _context.Set<IngredientStock>().Add(stock);
        }
        else
        {
            stock.Quantity += quantity;
            stock.LastMovementAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        // Record movement
        var movement = new IngredientMovement
        {
            MovementDate = DateTime.UtcNow,
            IngredientId = ingredientId,
            BranchId = branchId,
            MovementType = MovementType.TransferIn,
            Quantity = quantity,
            Unit = unit,
            BalanceAfter = stock.Quantity,
            ReferenceType = "Transfer",
            ReferenceId = transferId,
            CreatedByUserId = userId,
            Notes = "Трансфер - получение"
        };
        _context.Set<IngredientMovement>().Add(movement);
    }

    private async Task AddProductStockAsync(int branchId, int recipeId, int quantity, decimal priceUsd, int transferId, int userId)
    {
        var exchangeRate = await GetCurrentExchangeRateAsync();

        var stock = await _context.Set<ProductStock>()
            .FirstOrDefaultAsync(s => s.BranchId == branchId && s.RecipeId == recipeId);

        if (stock is null)
        {
            stock = new ProductStock
            {
                BranchId = branchId,
                RecipeId = recipeId,
                ProductionBatchId = null,
                ProductionDate = DateTime.UtcNow.Date,
                ExpiryDate = DateTime.UtcNow.Date.AddDays(30),
                Quantity = quantity,
                UnitCostUsd = priceUsd,
                UnitCostTjs = priceUsd * exchangeRate,
                ExchangeRate = exchangeRate,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Set<ProductStock>().Add(stock);
        }
        else
        {
            stock.Quantity += quantity;
            stock.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        // Record movement
        var movement = new ProductMovement
        {
            MovementDate = DateTime.UtcNow.Date,
            BranchId = branchId,
            RecipeId = recipeId,
            ProductionBatchId = null,
            OperationType = ProductMovementType.TransferIn,
            Quantity = quantity,
            BalanceAfter = stock.Quantity,
            DocumentType = "transfer",
            DocumentId = transferId,
            UserId = userId,
            Notes = "Трансфер - получение",
            CreatedAt = DateTime.UtcNow
        };
        _context.Set<ProductMovement>().Add(movement);
    }

    private async Task<decimal> GetCurrentExchangeRateAsync()
    {
        var rate = await _context.Set<ExchangeRate>()
            .OrderByDescending(r => r.RateDate)
            .FirstOrDefaultAsync();
        return rate?.Rate ?? 10.5m;
    }

    private static TransferDto MapToDto(Transfer transfer)
    {
        return new TransferDto
        {
            Id = transfer.Id,
            TransferNumber = transfer.TransferNumber,
            CreatedDate = transfer.CreatedDate,
            SenderBranchId = transfer.SenderBranchId,
            SenderBranchName = transfer.SenderBranch?.Name ?? string.Empty,
            ReceiverBranchId = transfer.ReceiverBranchId,
            ReceiverBranchName = transfer.ReceiverBranch?.Name ?? string.Empty,
            TransferType = transfer.TransferType,
            TransferTypeName = GetTransferTypeName(transfer.TransferType),
            Status = transfer.Status,
            StatusName = GetStatusName(transfer.Status),
            SentDate = transfer.SentDate,
            ReceivedDate = transfer.ReceivedDate,
            SentByUserId = transfer.SentByUserId,
            SentByUserLogin = transfer.SentByUser?.Login,
            ReceivedByUserId = transfer.ReceivedByUserId,
            ReceivedByUserLogin = transfer.ReceivedByUser?.Login,
            Comment = transfer.Comment,
            ItemsCount = transfer.Items.Count,
            CreatedAt = transfer.CreatedAt
        };
    }

    private static TransferDetailDto MapToDetailDto(Transfer transfer)
    {
        return new TransferDetailDto
        {
            Id = transfer.Id,
            TransferNumber = transfer.TransferNumber,
            CreatedDate = transfer.CreatedDate,
            SenderBranchId = transfer.SenderBranchId,
            SenderBranchName = transfer.SenderBranch?.Name ?? string.Empty,
            ReceiverBranchId = transfer.ReceiverBranchId,
            ReceiverBranchName = transfer.ReceiverBranch?.Name ?? string.Empty,
            TransferType = transfer.TransferType,
            TransferTypeName = GetTransferTypeName(transfer.TransferType),
            Status = transfer.Status,
            StatusName = GetStatusName(transfer.Status),
            SentDate = transfer.SentDate,
            ReceivedDate = transfer.ReceivedDate,
            SentByUserId = transfer.SentByUserId,
            SentByUserLogin = transfer.SentByUser?.Login,
            ReceivedByUserId = transfer.ReceivedByUserId,
            ReceivedByUserLogin = transfer.ReceivedByUser?.Login,
            Comment = transfer.Comment,
            ItemsCount = transfer.Items.Count,
            CreatedAt = transfer.CreatedAt,
            Items = transfer.Items.Select(i => new TransferItemDto
            {
                Id = i.Id,
                TransferId = i.TransferId,
                ItemId = i.ItemId,
                ItemType = i.ItemType,
                ItemTypeName = i.ItemType == TransferItemType.Ingredient ? "Сырьё" : "Продукция",
                QuantitySent = i.QuantitySent,
                QuantityReceived = i.QuantityReceived,
                Discrepancy = i.Discrepancy,
                TransferPriceUsd = i.TransferPriceUsd
            }).ToList()
        };
    }

    private static string GetTransferTypeName(TransferType type)
    {
        return type switch
        {
            TransferType.RawMaterials => "Сырьё и материалы",
            TransferType.FinishedProducts => "Готовая продукция",
            _ => type.ToString()
        };
    }

    private static string GetStatusName(TransferStatus status)
    {
        return status switch
        {
            TransferStatus.Created => "Создан",
            TransferStatus.InTransit => "В пути",
            TransferStatus.Received => "Получен",
            TransferStatus.Cancelled => "Отменён",
            _ => status.ToString()
        };
    }

    #endregion
}
