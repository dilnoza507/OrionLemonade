using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface IEmployeeService
{
    Task<EmployeeDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<EmployeeDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<EmployeeDto>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<EmployeeDto>> GetByBranchAsync(int branchId, CancellationToken cancellationToken = default);
    Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto, CancellationToken cancellationToken = default);
    Task<EmployeeDto?> UpdateAsync(int id, UpdateEmployeeDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
