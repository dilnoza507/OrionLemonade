using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Services;

public class PriceListService : IPriceListService
{
    private readonly DbContext _context;

    public PriceListService(DbContext context)
    {
        _context = context;
    }

    #region Price Lists

    public async Task<IEnumerable<PriceListDto>> GetPriceListsAsync(int? branchId = null, bool? isActive = null)
    {
        var query = _context.Set<PriceList>()
            .Include(p => p.Branch)
            .Include(p => p.Items)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(p => p.BranchId == branchId.Value || p.BranchId == null);

        if (isActive.HasValue)
            query = query.Where(p => p.IsActive == isActive.Value);

        var priceLists = await query
            .OrderBy(p => p.Name)
            .ToListAsync();

        return priceLists.Select(MapToDto);
    }

    public async Task<PriceListDto?> GetPriceListByIdAsync(int id)
    {
        var priceList = await _context.Set<PriceList>()
            .Include(p => p.Branch)
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == id);

        return priceList is null ? null : MapToDto(priceList);
    }

    public async Task<PriceListDetailDto?> GetPriceListDetailAsync(int id)
    {
        var priceList = await _context.Set<PriceList>()
            .Include(p => p.Branch)
            .Include(p => p.Items)
                .ThenInclude(i => i.Recipe)
            .FirstOrDefaultAsync(p => p.Id == id);

        return priceList is null ? null : MapToDetailDto(priceList);
    }

    public async Task<PriceListDto> CreatePriceListAsync(CreatePriceListDto dto)
    {
        var priceList = new PriceList
        {
            BranchId = dto.BranchId,
            Name = dto.Name,
            Description = dto.Description,
            ListType = dto.ListType,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Set<PriceList>().Add(priceList);
        await _context.SaveChangesAsync();

        return (await GetPriceListByIdAsync(priceList.Id))!;
    }

    public async Task<PriceListDto?> UpdatePriceListAsync(int id, UpdatePriceListDto dto)
    {
        var priceList = await _context.Set<PriceList>()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (priceList is null) return null;

        priceList.Name = dto.Name;
        priceList.Description = dto.Description;
        priceList.ListType = dto.ListType;
        priceList.IsActive = dto.IsActive;
        priceList.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetPriceListByIdAsync(id);
    }

    public async Task<bool> DeletePriceListAsync(int id)
    {
        var priceList = await _context.Set<PriceList>()
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (priceList is null) return false;

        _context.Set<PriceListItem>().RemoveRange(priceList.Items);
        _context.Set<PriceList>().Remove(priceList);
        await _context.SaveChangesAsync();

        return true;
    }

    #endregion

    #region Price List Items

    public async Task<IEnumerable<PriceListItemDto>> GetPriceListItemsAsync(int priceListId)
    {
        var items = await _context.Set<PriceListItem>()
            .Include(i => i.Recipe)
            .Where(i => i.PriceListId == priceListId)
            .OrderBy(i => i.Recipe.ProductName)
            .ToListAsync();

        return items.Select(MapItemToDto);
    }

    public async Task<PriceListItemDto?> GetPriceListItemAsync(int id)
    {
        var item = await _context.Set<PriceListItem>()
            .Include(i => i.Recipe)
            .FirstOrDefaultAsync(i => i.Id == id);

        return item is null ? null : MapItemToDto(item);
    }

    public async Task<PriceListItemDto> AddItemAsync(int priceListId, CreatePriceListItemDto dto)
    {
        // Check if item already exists for this recipe
        var existing = await _context.Set<PriceListItem>()
            .FirstOrDefaultAsync(i => i.PriceListId == priceListId && i.RecipeId == dto.RecipeId);

        if (existing != null)
        {
            // Update existing
            existing.PriceTjs = dto.PriceTjs;
            existing.MinOrderQuantity = dto.MinOrderQuantity;
            existing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return (await GetPriceListItemAsync(existing.Id))!;
        }

        var item = new PriceListItem
        {
            PriceListId = priceListId,
            RecipeId = dto.RecipeId,
            PriceTjs = dto.PriceTjs,
            MinOrderQuantity = dto.MinOrderQuantity,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Set<PriceListItem>().Add(item);
        await _context.SaveChangesAsync();

        return (await GetPriceListItemAsync(item.Id))!;
    }

    public async Task<PriceListItemDto?> UpdateItemAsync(int id, UpdatePriceListItemDto dto)
    {
        var item = await _context.Set<PriceListItem>()
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item is null) return null;

        item.PriceTjs = dto.PriceTjs;
        item.MinOrderQuantity = dto.MinOrderQuantity;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetPriceListItemAsync(id);
    }

    public async Task<bool> DeleteItemAsync(int id)
    {
        var item = await _context.Set<PriceListItem>()
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item is null) return false;

        _context.Set<PriceListItem>().Remove(item);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task BulkUpdateItemsAsync(int priceListId, List<BulkPriceListItemDto> items)
    {
        foreach (var itemDto in items)
        {
            var existing = await _context.Set<PriceListItem>()
                .FirstOrDefaultAsync(i => i.PriceListId == priceListId && i.RecipeId == itemDto.RecipeId);

            if (existing != null)
            {
                existing.PriceTjs = itemDto.PriceTjs;
                existing.MinOrderQuantity = itemDto.MinOrderQuantity;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var newItem = new PriceListItem
                {
                    PriceListId = priceListId,
                    RecipeId = itemDto.RecipeId,
                    PriceTjs = itemDto.PriceTjs,
                    MinOrderQuantity = itemDto.MinOrderQuantity,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Set<PriceListItem>().Add(newItem);
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task<decimal?> GetPriceAsync(int priceListId, int recipeId)
    {
        var item = await _context.Set<PriceListItem>()
            .FirstOrDefaultAsync(i => i.PriceListId == priceListId && i.RecipeId == recipeId);

        return item?.PriceTjs;
    }

    #endregion

    #region Mapping

    private static PriceListDto MapToDto(PriceList entity)
    {
        return new PriceListDto
        {
            Id = entity.Id,
            BranchId = entity.BranchId,
            BranchName = entity.Branch?.Name,
            Name = entity.Name,
            Description = entity.Description,
            ListType = entity.ListType,
            ListTypeName = GetListTypeName(entity.ListType),
            IsActive = entity.IsActive,
            ItemCount = entity.Items?.Count ?? 0,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    private static PriceListDetailDto MapToDetailDto(PriceList entity)
    {
        return new PriceListDetailDto
        {
            Id = entity.Id,
            BranchId = entity.BranchId,
            BranchName = entity.Branch?.Name,
            Name = entity.Name,
            Description = entity.Description,
            ListType = entity.ListType,
            ListTypeName = GetListTypeName(entity.ListType),
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            Items = entity.Items?.Select(MapItemToDto).ToList() ?? new List<PriceListItemDto>()
        };
    }

    private static PriceListItemDto MapItemToDto(PriceListItem entity)
    {
        return new PriceListItemDto
        {
            Id = entity.Id,
            PriceListId = entity.PriceListId,
            RecipeId = entity.RecipeId,
            RecipeName = entity.Recipe?.Name ?? string.Empty,
            ProductName = entity.Recipe?.ProductName ?? string.Empty,
            PriceTjs = entity.PriceTjs,
            MinOrderQuantity = entity.MinOrderQuantity,
            UpdatedAt = entity.UpdatedAt
        };
    }

    private static string GetListTypeName(PriceListType type)
    {
        return type switch
        {
            PriceListType.Base => "Базовый",
            PriceListType.Special => "Специальный",
            _ => type.ToString()
        };
    }

    #endregion
}
