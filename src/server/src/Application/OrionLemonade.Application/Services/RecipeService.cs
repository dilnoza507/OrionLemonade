using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Services;

public class RecipeService : IRecipeService
{
    private readonly DbContext _dbContext;

    public RecipeService(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    #region Recipe Operations

    public async Task<RecipeDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<Recipe>()
            .Include(r => r.Versions.Where(v => v.IsActive))
                .ThenInclude(v => v.Ingredients)
                    .ThenInclude(i => i.Ingredient)
            .Include(r => r.Versions.Where(v => v.IsActive))
                .ThenInclude(v => v.Packaging)
                    .ThenInclude(p => p.Ingredient)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        return entity is null ? null : MapToDto(entity);
    }

    public async Task<RecipeDetailDto?> GetDetailByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<Recipe>()
            .Include(r => r.Versions.OrderByDescending(v => v.VersionNumber))
                .ThenInclude(v => v.Ingredients)
                    .ThenInclude(i => i.Ingredient)
            .Include(r => r.Versions)
                .ThenInclude(v => v.Packaging)
                    .ThenInclude(p => p.Ingredient)
            .Include(r => r.Versions)
                .ThenInclude(v => v.CreatedByUser)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        return entity is null ? null : MapToDetailDto(entity);
    }

    public async Task<IEnumerable<RecipeDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<Recipe>()
            .Include(r => r.Versions.Where(v => v.IsActive))
            .OrderBy(r => r.Name)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto);
    }

    public async Task<IEnumerable<RecipeDto>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<Recipe>()
            .Include(r => r.Versions.Where(v => v.IsActive))
            .Where(r => r.Status == RecipeStatus.Active)
            .OrderBy(r => r.Name)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto);
    }

    public async Task<RecipeDto> CreateAsync(CreateRecipeDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new Recipe
        {
            Name = dto.Name,
            Description = dto.Description,
            ProductName = dto.ProductName,
            OutputVolume = dto.OutputVolume,
            OutputUnit = dto.OutputUnit,
            StandardBatchSize = dto.StandardBatchSize,
            Status = RecipeStatus.Draft,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<Recipe>().Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<RecipeDto?> UpdateAsync(int id, UpdateRecipeDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<Recipe>().FindAsync([id], cancellationToken);
        if (entity is null) return null;

        entity.Name = dto.Name;
        entity.Description = dto.Description;
        entity.ProductName = dto.ProductName;
        entity.OutputVolume = dto.OutputVolume;
        entity.OutputUnit = dto.OutputUnit;
        entity.StandardBatchSize = dto.StandardBatchSize;
        entity.Status = dto.Status;
        entity.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<Recipe>()
            .Include(r => r.Versions)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (entity is null) return false;

        // Delete all versions first (cascade should handle ingredients/packaging)
        _dbContext.Set<RecipeVersion>().RemoveRange(entity.Versions);
        _dbContext.Set<Recipe>().Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    #endregion

    #region RecipeVersion Operations

    public async Task<RecipeVersionDto?> GetVersionByIdAsync(int versionId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<RecipeVersion>()
            .Include(v => v.Ingredients)
                .ThenInclude(i => i.Ingredient)
            .Include(v => v.Packaging)
                .ThenInclude(p => p.Ingredient)
            .Include(v => v.CreatedByUser)
            .FirstOrDefaultAsync(v => v.Id == versionId, cancellationToken);

        return entity is null ? null : MapVersionToDto(entity);
    }

    public async Task<RecipeVersionDto> CreateVersionAsync(CreateRecipeVersionDto dto, int userId, CancellationToken cancellationToken = default)
    {
        // Get the next version number
        var maxVersionNumber = await _dbContext.Set<RecipeVersion>()
            .Where(v => v.RecipeId == dto.RecipeId)
            .MaxAsync(v => (int?)v.VersionNumber, cancellationToken) ?? 0;

        var entity = new RecipeVersion
        {
            RecipeId = dto.RecipeId,
            VersionNumber = maxVersionNumber + 1,
            Notes = dto.Notes,
            IsActive = false,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<RecipeVersion>().Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Add ingredients
        foreach (var ingredientDto in dto.Ingredients)
        {
            var ingredient = new RecipeIngredient
            {
                RecipeVersionId = entity.Id,
                IngredientId = ingredientDto.IngredientId,
                Quantity = ingredientDto.Quantity,
                Unit = ingredientDto.Unit,
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.Set<RecipeIngredient>().Add(ingredient);
        }

        // Add packaging
        foreach (var packagingDto in dto.Packaging)
        {
            var packaging = new RecipePackaging
            {
                RecipeVersionId = entity.Id,
                IngredientId = packagingDto.IngredientId,
                Quantity = packagingDto.Quantity,
                Unit = packagingDto.Unit,
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.Set<RecipePackaging>().Add(packaging);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        // Load full entity for response
        return (await GetVersionByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<RecipeVersionDto?> UpdateVersionAsync(int versionId, UpdateRecipeVersionDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<RecipeVersion>()
            .FirstOrDefaultAsync(v => v.Id == versionId, cancellationToken);

        if (entity is null) return null;

        entity.Notes = dto.Notes;
        entity.UpdatedAt = DateTime.UtcNow;

        // Remove existing ingredients and packaging
        var existingIngredients = await _dbContext.Set<RecipeIngredient>()
            .Where(i => i.RecipeVersionId == versionId)
            .ToListAsync(cancellationToken);
        _dbContext.Set<RecipeIngredient>().RemoveRange(existingIngredients);

        var existingPackaging = await _dbContext.Set<RecipePackaging>()
            .Where(p => p.RecipeVersionId == versionId)
            .ToListAsync(cancellationToken);
        _dbContext.Set<RecipePackaging>().RemoveRange(existingPackaging);

        await _dbContext.SaveChangesAsync(cancellationToken);

        // Add new ingredients
        foreach (var ingredientDto in dto.Ingredients)
        {
            var ingredient = new RecipeIngredient
            {
                RecipeVersionId = entity.Id,
                IngredientId = ingredientDto.IngredientId,
                Quantity = ingredientDto.Quantity,
                Unit = ingredientDto.Unit,
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.Set<RecipeIngredient>().Add(ingredient);
        }

        // Add new packaging
        foreach (var packagingDto in dto.Packaging)
        {
            var packaging = new RecipePackaging
            {
                RecipeVersionId = entity.Id,
                IngredientId = packagingDto.IngredientId,
                Quantity = packagingDto.Quantity,
                Unit = packagingDto.Unit,
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.Set<RecipePackaging>().Add(packaging);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return (await GetVersionByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<bool> ActivateVersionAsync(int versionId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<RecipeVersion>()
            .FirstOrDefaultAsync(v => v.Id == versionId, cancellationToken);

        if (entity is null) return false;

        // Deactivate all other versions of this recipe
        var otherVersions = await _dbContext.Set<RecipeVersion>()
            .Where(v => v.RecipeId == entity.RecipeId && v.Id != versionId)
            .ToListAsync(cancellationToken);

        foreach (var version in otherVersions)
        {
            version.IsActive = false;
        }

        entity.IsActive = true;
        entity.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<bool> DeleteVersionAsync(int versionId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<RecipeVersion>()
            .Include(v => v.Ingredients)
            .Include(v => v.Packaging)
            .FirstOrDefaultAsync(v => v.Id == versionId, cancellationToken);

        if (entity is null) return false;

        // Don't allow deleting active version
        if (entity.IsActive) return false;

        _dbContext.Set<RecipeIngredient>().RemoveRange(entity.Ingredients);
        _dbContext.Set<RecipePackaging>().RemoveRange(entity.Packaging);
        _dbContext.Set<RecipeVersion>().Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    #endregion

    #region Mapping

    private static RecipeDto MapToDto(Recipe entity)
    {
        var activeVersion = entity.Versions?.FirstOrDefault(v => v.IsActive);

        return new RecipeDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            ProductName = entity.ProductName,
            OutputVolume = entity.OutputVolume,
            OutputUnit = entity.OutputUnit,
            StandardBatchSize = entity.StandardBatchSize,
            Status = entity.Status,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            ActiveVersion = activeVersion != null ? MapVersionToDto(activeVersion) : null,
            VersionCount = entity.Versions?.Count ?? 0
        };
    }

    private static RecipeDetailDto MapToDetailDto(Recipe entity)
    {
        var activeVersion = entity.Versions?.FirstOrDefault(v => v.IsActive);

        return new RecipeDetailDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            ProductName = entity.ProductName,
            OutputVolume = entity.OutputVolume,
            OutputUnit = entity.OutputUnit,
            StandardBatchSize = entity.StandardBatchSize,
            Status = entity.Status,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            ActiveVersion = activeVersion != null ? MapVersionToDto(activeVersion) : null,
            VersionCount = entity.Versions?.Count ?? 0,
            Versions = entity.Versions?.Select(MapVersionToDto).ToList() ?? new()
        };
    }

    private static RecipeVersionDto MapVersionToDto(RecipeVersion entity)
    {
        return new RecipeVersionDto
        {
            Id = entity.Id,
            RecipeId = entity.RecipeId,
            VersionNumber = entity.VersionNumber,
            Notes = entity.Notes,
            IsActive = entity.IsActive,
            CreatedByUserId = entity.CreatedByUserId,
            CreatedByUserLogin = entity.CreatedByUser?.Login,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            Ingredients = entity.Ingredients?.Select(MapIngredientToDto).ToList() ?? new(),
            Packaging = entity.Packaging?.Select(MapPackagingToDto).ToList() ?? new()
        };
    }

    private static RecipeIngredientDto MapIngredientToDto(RecipeIngredient entity)
    {
        return new RecipeIngredientDto
        {
            Id = entity.Id,
            RecipeVersionId = entity.RecipeVersionId,
            IngredientId = entity.IngredientId,
            IngredientName = entity.Ingredient?.Name ?? string.Empty,
            Quantity = entity.Quantity,
            Unit = entity.Unit
        };
    }

    private static RecipePackagingDto MapPackagingToDto(RecipePackaging entity)
    {
        return new RecipePackagingDto
        {
            Id = entity.Id,
            RecipeVersionId = entity.RecipeVersionId,
            IngredientId = entity.IngredientId,
            IngredientName = entity.Ingredient?.Name ?? string.Empty,
            Quantity = entity.Quantity,
            Unit = entity.Unit
        };
    }

    #endregion
}
