using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Services;

public class IngredientService : IIngredientService
{
    private readonly DbContext _dbContext;

    public IngredientService(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IngredientDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<Ingredient>()
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        return entity is null ? null : MapToDto(entity);
    }

    public async Task<IEnumerable<IngredientDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<Ingredient>()
            .OrderBy(e => e.Category)
            .ThenBy(e => e.Name)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto);
    }

    public async Task<IEnumerable<IngredientDto>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<Ingredient>()
            .Where(e => e.Status == IngredientStatus.Active)
            .OrderBy(e => e.Category)
            .ThenBy(e => e.Name)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto);
    }

    public async Task<IngredientDto> CreateAsync(CreateIngredientDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new Ingredient
        {
            Name = dto.Name,
            Category = dto.Category,
            Subcategory = dto.Subcategory,
            BaseUnit = dto.BaseUnit,
            PurchaseUnit = dto.PurchaseUnit,
            ConversionRate = dto.ConversionRate,
            MinStock = dto.MinStock,
            ShelfLifeDays = dto.ShelfLifeDays,
            Status = IngredientStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<Ingredient>().Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<IngredientDto?> UpdateAsync(int id, UpdateIngredientDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<Ingredient>().FindAsync([id], cancellationToken);
        if (entity is null) return null;

        entity.Name = dto.Name;
        entity.Category = dto.Category;
        entity.Subcategory = dto.Subcategory;
        entity.BaseUnit = dto.BaseUnit;
        entity.PurchaseUnit = dto.PurchaseUnit;
        entity.ConversionRate = dto.ConversionRate;
        entity.MinStock = dto.MinStock;
        entity.ShelfLifeDays = dto.ShelfLifeDays;
        entity.Status = dto.Status;
        entity.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<Ingredient>().FindAsync([id], cancellationToken);
        if (entity is null) return false;

        _dbContext.Set<Ingredient>().Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static IngredientDto MapToDto(Ingredient entity)
    {
        return new IngredientDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Category = entity.Category,
            Subcategory = entity.Subcategory,
            BaseUnit = entity.BaseUnit,
            PurchaseUnit = entity.PurchaseUnit,
            ConversionRate = entity.ConversionRate,
            MinStock = entity.MinStock,
            ShelfLifeDays = entity.ShelfLifeDays,
            Status = entity.Status,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
