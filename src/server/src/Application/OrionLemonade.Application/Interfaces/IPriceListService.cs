using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface IPriceListService
{
    // Price Lists
    Task<IEnumerable<PriceListDto>> GetPriceListsAsync(int? branchId = null, bool? isActive = null);
    Task<PriceListDto?> GetPriceListByIdAsync(int id);
    Task<PriceListDetailDto?> GetPriceListDetailAsync(int id);
    Task<PriceListDto> CreatePriceListAsync(CreatePriceListDto dto);
    Task<PriceListDto?> UpdatePriceListAsync(int id, UpdatePriceListDto dto);
    Task<bool> DeletePriceListAsync(int id);

    // Price List Items
    Task<IEnumerable<PriceListItemDto>> GetPriceListItemsAsync(int priceListId);
    Task<PriceListItemDto?> GetPriceListItemAsync(int id);
    Task<PriceListItemDto> AddItemAsync(int priceListId, CreatePriceListItemDto dto);
    Task<PriceListItemDto?> UpdateItemAsync(int id, UpdatePriceListItemDto dto);
    Task<bool> DeleteItemAsync(int id);
    Task BulkUpdateItemsAsync(int priceListId, List<BulkPriceListItemDto> items);

    // Get price for a recipe
    Task<decimal?> GetPriceAsync(int priceListId, int recipeId);
}
