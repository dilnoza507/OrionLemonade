using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface IExpenseCategoryService
{
    Task<ExpenseCategoryDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ExpenseCategoryDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ExpenseCategoryDto> CreateAsync(CreateExpenseCategoryDto dto, CancellationToken cancellationToken = default);
    Task<ExpenseCategoryDto?> UpdateAsync(int id, UpdateExpenseCategoryDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
