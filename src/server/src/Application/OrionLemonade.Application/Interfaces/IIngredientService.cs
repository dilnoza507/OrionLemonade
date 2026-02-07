using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface IIngredientService
{
    Task<IngredientDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<IngredientDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<IngredientDto>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IngredientDto> CreateAsync(CreateIngredientDto dto, CancellationToken cancellationToken = default);
    Task<IngredientDto?> UpdateAsync(int id, UpdateIngredientDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
