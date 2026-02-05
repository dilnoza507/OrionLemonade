using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface IUserBranchService
{
    Task<UserBranchDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserBranchDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<UserBranchDto>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<UserBranchDto> CreateAsync(CreateUserBranchDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
