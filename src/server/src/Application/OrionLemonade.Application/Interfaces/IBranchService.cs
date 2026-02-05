using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface IBranchService
{
    Task<BranchDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<BranchDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<BranchDto> CreateAsync(CreateBranchDto dto, CancellationToken cancellationToken = default);
    Task<BranchDto?> UpdateAsync(int id, UpdateBranchDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
