using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;

namespace OrionLemonade.Application.Services;

public class ExpenseCategoryService : IExpenseCategoryService
{
    private readonly DbContext _dbContext;

    public ExpenseCategoryService(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ExpenseCategoryDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ExpenseCategory>()
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        return entity is null ? null : MapToDto(entity);
    }

    public async Task<IEnumerable<ExpenseCategoryDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ExpenseCategory>()
            .OrderBy(e => e.Name)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto);
    }

    public async Task<ExpenseCategoryDto> CreateAsync(CreateExpenseCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new ExpenseCategory
        {
            Name = dto.Name,
            Description = dto.Description,
            IsSystem = false,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<ExpenseCategory>().Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<ExpenseCategoryDto?> UpdateAsync(int id, UpdateExpenseCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ExpenseCategory>().FindAsync([id], cancellationToken);
        if (entity is null) return null;

        entity.Name = dto.Name;
        entity.Description = dto.Description;
        entity.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ExpenseCategory>().FindAsync([id], cancellationToken);
        if (entity is null) return false;

        // Prevent deletion of system categories
        if (entity.IsSystem) return false;

        _dbContext.Set<ExpenseCategory>().Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static ExpenseCategoryDto MapToDto(ExpenseCategory entity)
    {
        return new ExpenseCategoryDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            IsSystem = entity.IsSystem,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
