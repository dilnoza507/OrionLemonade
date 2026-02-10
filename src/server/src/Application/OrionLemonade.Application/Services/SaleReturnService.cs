using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Services;

public class SaleReturnService : ISaleReturnService
{
    private readonly DbContext _context;

    public SaleReturnService(DbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SaleReturnDto>> GetReturnsAsync(int? branchId = null, int? clientId = null, DateTime? from = null, DateTime? to = null)
    {
        var query = _context.Set<SaleReturn>()
            .Include(r => r.Branch)
            .Include(r => r.Sale)
            .Include(r => r.Client)
            .Include(r => r.CreatedByUser)
            .Include(r => r.Items)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(r => r.BranchId == branchId.Value);

        if (clientId.HasValue)
            query = query.Where(r => r.ClientId == clientId.Value);

        if (from.HasValue)
            query = query.Where(r => r.ReturnDate >= from.Value);

        if (to.HasValue)
            query = query.Where(r => r.ReturnDate <= to.Value);

        var returns = await query
            .OrderByDescending(r => r.ReturnDate)
            .ThenByDescending(r => r.CreatedAt)
            .ToListAsync();

        return returns.Select(MapToDto);
    }

    public async Task<SaleReturnDto?> GetReturnByIdAsync(int id)
    {
        var saleReturn = await _context.Set<SaleReturn>()
            .Include(r => r.Branch)
            .Include(r => r.Sale)
            .Include(r => r.Client)
            .Include(r => r.CreatedByUser)
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == id);

        return saleReturn is null ? null : MapToDto(saleReturn);
    }

    public async Task<SaleReturnDetailDto?> GetReturnDetailAsync(int id)
    {
        var saleReturn = await _context.Set<SaleReturn>()
            .Include(r => r.Branch)
            .Include(r => r.Sale)
            .Include(r => r.Client)
            .Include(r => r.CreatedByUser)
            .Include(r => r.Items)
                .ThenInclude(i => i.Recipe)
            .FirstOrDefaultAsync(r => r.Id == id);

        return saleReturn is null ? null : MapToDetailDto(saleReturn);
    }

    public async Task<SaleReturnDetailDto> CreateReturnAsync(CreateSaleReturnDto dto, int userId)
    {
        var branch = await _context.Set<Branch>().FindAsync(dto.BranchId);
        if (branch is null)
            throw new InvalidOperationException("Филиал не найден");

        var sale = await _context.Set<Sale>()
            .Include(s => s.Items)
            .FirstOrDefaultAsync(s => s.Id == dto.SaleId);
        if (sale is null)
            throw new InvalidOperationException("Продажа не найдена");

        // Validate that return items exist in the sale
        foreach (var item in dto.Items)
        {
            var saleItem = sale.Items.FirstOrDefault(si => si.RecipeId == item.RecipeId);
            if (saleItem is null)
                throw new InvalidOperationException($"Продукт не найден в продаже");
            if (item.Quantity > saleItem.Quantity)
                throw new InvalidOperationException($"Количество возврата превышает количество в продаже");
        }

        var returnNumber = await GenerateReturnNumberAsync(branch.Code);

        var saleReturn = new SaleReturn
        {
            ReturnNumber = returnNumber,
            BranchId = dto.BranchId,
            ReturnDate = dto.ReturnDate,
            SaleId = dto.SaleId,
            ClientId = dto.ClientId,
            Reason = dto.Reason,
            Comment = dto.Comment,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<SaleReturn>().Add(saleReturn);
        await _context.SaveChangesAsync();

        // Add items
        foreach (var itemDto in dto.Items)
        {
            var item = new SaleReturnItem
            {
                ReturnId = saleReturn.Id,
                RecipeId = itemDto.RecipeId,
                Quantity = itemDto.Quantity,
                ReturnToStock = itemDto.ReturnToStock
            };
            _context.Set<SaleReturnItem>().Add(item);

            // If returning to stock, add back to ProductStock
            if (itemDto.ReturnToStock)
            {
                await ReturnToStockAsync(dto.BranchId, itemDto.RecipeId, itemDto.Quantity, saleReturn.Id, userId);
            }
        }

        await _context.SaveChangesAsync();

        return (await GetReturnDetailAsync(saleReturn.Id))!;
    }

    public async Task<SaleReturnDto?> UpdateReturnAsync(int id, UpdateSaleReturnDto dto)
    {
        var saleReturn = await _context.Set<SaleReturn>().FindAsync(id);
        if (saleReturn is null) return null;

        saleReturn.ReturnDate = dto.ReturnDate;
        saleReturn.Reason = dto.Reason;
        saleReturn.Comment = dto.Comment;

        await _context.SaveChangesAsync();

        return await GetReturnByIdAsync(id);
    }

    public async Task<bool> DeleteReturnAsync(int id)
    {
        var saleReturn = await _context.Set<SaleReturn>()
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (saleReturn is null) return false;

        // Note: In production, you might want to reverse the stock movements
        // For now, we just delete the return record
        _context.Set<SaleReturnItem>().RemoveRange(saleReturn.Items);
        _context.Set<SaleReturn>().Remove(saleReturn);
        await _context.SaveChangesAsync();

        return true;
    }

    private async Task<string> GenerateReturnNumberAsync(string branchCode)
    {
        var today = DateTime.UtcNow.Date;
        var prefix = $"ВЗ-{branchCode}-{today:yyyyMMdd}";

        var lastReturn = await _context.Set<SaleReturn>()
            .Where(r => r.ReturnNumber.StartsWith(prefix))
            .OrderByDescending(r => r.ReturnNumber)
            .FirstOrDefaultAsync();

        int sequence = 1;
        if (lastReturn != null)
        {
            var parts = lastReturn.ReturnNumber.Split('-');
            if (parts.Length == 4 && int.TryParse(parts[3], out var lastSeq))
            {
                sequence = lastSeq + 1;
            }
        }

        return $"{prefix}-{sequence:D3}";
    }

    private async Task ReturnToStockAsync(int branchId, int recipeId, int quantity, int returnId, int userId)
    {
        // Find existing stock or create new
        var stock = await _context.Set<ProductStock>()
            .FirstOrDefaultAsync(s => s.BranchId == branchId && s.RecipeId == recipeId);

        if (stock is null)
        {
            // Create new stock entry - no production batch info since this is a return
            stock = new ProductStock
            {
                BranchId = branchId,
                RecipeId = recipeId,
                ProductionBatchId = null,
                ProductionDate = DateTime.UtcNow.Date,
                ExpiryDate = DateTime.UtcNow.Date.AddDays(30), // Default expiry
                Quantity = quantity,
                UnitCostUsd = 0,
                UnitCostTjs = 0,
                ExchangeRate = 1,
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
            OperationType = ProductMovementType.Return,
            Quantity = quantity,
            BalanceAfter = stock.Quantity,
            DocumentType = "return",
            DocumentId = returnId,
            UserId = userId,
            Notes = "Возврат от клиента",
            CreatedAt = DateTime.UtcNow
        };
        _context.Set<ProductMovement>().Add(movement);
    }

    private static SaleReturnDto MapToDto(SaleReturn saleReturn)
    {
        return new SaleReturnDto
        {
            Id = saleReturn.Id,
            ReturnNumber = saleReturn.ReturnNumber,
            BranchId = saleReturn.BranchId,
            BranchName = saleReturn.Branch?.Name ?? string.Empty,
            ReturnDate = saleReturn.ReturnDate,
            SaleId = saleReturn.SaleId,
            SaleNumber = saleReturn.Sale?.SaleNumber ?? string.Empty,
            ClientId = saleReturn.ClientId,
            ClientName = saleReturn.Client?.Name ?? string.Empty,
            Reason = saleReturn.Reason,
            ReasonName = GetReasonName(saleReturn.Reason),
            Comment = saleReturn.Comment,
            TotalQuantity = saleReturn.Items.Sum(i => i.Quantity),
            CreatedByUserId = saleReturn.CreatedByUserId,
            CreatedByUserLogin = saleReturn.CreatedByUser?.Login,
            CreatedAt = saleReturn.CreatedAt
        };
    }

    private static SaleReturnDetailDto MapToDetailDto(SaleReturn saleReturn)
    {
        return new SaleReturnDetailDto
        {
            Id = saleReturn.Id,
            ReturnNumber = saleReturn.ReturnNumber,
            BranchId = saleReturn.BranchId,
            BranchName = saleReturn.Branch?.Name ?? string.Empty,
            ReturnDate = saleReturn.ReturnDate,
            SaleId = saleReturn.SaleId,
            SaleNumber = saleReturn.Sale?.SaleNumber ?? string.Empty,
            ClientId = saleReturn.ClientId,
            ClientName = saleReturn.Client?.Name ?? string.Empty,
            Reason = saleReturn.Reason,
            ReasonName = GetReasonName(saleReturn.Reason),
            Comment = saleReturn.Comment,
            TotalQuantity = saleReturn.Items.Sum(i => i.Quantity),
            CreatedByUserId = saleReturn.CreatedByUserId,
            CreatedByUserLogin = saleReturn.CreatedByUser?.Login,
            CreatedAt = saleReturn.CreatedAt,
            Items = saleReturn.Items.Select(i => new SaleReturnItemDto
            {
                Id = i.Id,
                ReturnId = i.ReturnId,
                RecipeId = i.RecipeId,
                ProductName = i.Recipe?.ProductName ?? string.Empty,
                Quantity = i.Quantity,
                ReturnToStock = i.ReturnToStock
            }).ToList()
        };
    }

    private static string GetReasonName(ReturnReason reason)
    {
        return reason switch
        {
            ReturnReason.Defect => "Брак",
            ReturnReason.WrongProduct => "Неверный товар",
            ReturnReason.Expired => "Истёк срок годности",
            ReturnReason.Other => "Другое",
            _ => reason.ToString()
        };
    }
}
