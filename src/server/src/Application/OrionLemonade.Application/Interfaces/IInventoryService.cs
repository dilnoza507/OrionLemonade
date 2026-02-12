using OrionLemonade.Application.DTOs;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Interfaces;

public interface IInventoryService
{
    Task<IEnumerable<InventoryDto>> GetInventoriesAsync(int? branchId = null, InventoryType? type = null, InventoryStatus? status = null);
    Task<InventoryDto?> GetInventoryByIdAsync(int id);
    Task<InventoryDetailDto?> GetInventoryDetailAsync(int id);
    Task<InventoryDetailDto> CreateInventoryAsync(CreateInventoryDto dto, int userId);
    Task<InventoryDto?> StartInventoryAsync(int id, int userId);
    Task<InventoryDto?> CompleteInventoryAsync(int id, CompleteInventoryDto dto, int userId);
    Task<InventoryDto?> CancelInventoryAsync(int id);
    Task<bool> DeleteInventoryAsync(int id);
}
