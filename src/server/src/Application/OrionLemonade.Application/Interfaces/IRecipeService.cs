using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface IRecipeService
{
    // Recipe operations
    Task<RecipeDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<RecipeDetailDto?> GetDetailByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<RecipeDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<RecipeDto>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<RecipeDto> CreateAsync(CreateRecipeDto dto, CancellationToken cancellationToken = default);
    Task<RecipeDto?> UpdateAsync(int id, UpdateRecipeDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);

    // RecipeVersion operations
    Task<RecipeVersionDto?> GetVersionByIdAsync(int versionId, CancellationToken cancellationToken = default);
    Task<RecipeVersionDto> CreateVersionAsync(CreateRecipeVersionDto dto, int userId, CancellationToken cancellationToken = default);
    Task<RecipeVersionDto?> UpdateVersionAsync(int versionId, UpdateRecipeVersionDto dto, CancellationToken cancellationToken = default);
    Task<bool> ActivateVersionAsync(int versionId, CancellationToken cancellationToken = default);
    Task<bool> DeleteVersionAsync(int versionId, CancellationToken cancellationToken = default);
}
