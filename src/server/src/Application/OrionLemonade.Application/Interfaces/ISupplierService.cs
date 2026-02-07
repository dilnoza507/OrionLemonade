using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface ISupplierService
{
    Task<SupplierDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<SupplierDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<SupplierDto>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<SupplierDto> CreateAsync(CreateSupplierDto dto, CancellationToken cancellationToken = default);
    Task<SupplierDto?> UpdateAsync(int id, UpdateSupplierDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
