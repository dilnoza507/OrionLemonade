using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface IItemService
{
    Task<ItemDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ItemDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ItemDto> CreateAsync(CreateItemDto dto, CancellationToken cancellationToken = default);
    Task<ItemDto?> UpdateAsync(int id, UpdateItemDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
