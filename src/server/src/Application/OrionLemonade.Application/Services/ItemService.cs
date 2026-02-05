using AutoMapper;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Interfaces;

namespace OrionLemonade.Application.Services;

public class ItemService : IItemService
{
    private readonly IRepository<Item> _repository;
    private readonly IMapper _mapper;

    public ItemService(IRepository<Item> repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<ItemDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await _repository.GetByIdAsync(id, cancellationToken);
        return item is null ? null : _mapper.Map<ItemDto>(item);
    }

    public async Task<IEnumerable<ItemDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var items = await _repository.GetAllAsync(cancellationToken);
        return _mapper.Map<IEnumerable<ItemDto>>(items);
    }

    public async Task<ItemDto> CreateAsync(CreateItemDto dto, CancellationToken cancellationToken = default)
    {
        var item = _mapper.Map<Item>(dto);
        await _repository.AddAsync(item, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return _mapper.Map<ItemDto>(item);
    }

    public async Task<ItemDto?> UpdateAsync(int id, UpdateItemDto dto, CancellationToken cancellationToken = default)
    {
        var item = await _repository.GetByIdAsync(id, cancellationToken);
        if (item is null) return null;

        _mapper.Map(dto, item);
        item.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(item, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return _mapper.Map<ItemDto>(item);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await _repository.GetByIdAsync(id, cancellationToken);
        if (item is null) return false;

        await _repository.DeleteAsync(item, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return true;
    }
}
