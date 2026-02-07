using AutoMapper;
using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;

namespace OrionLemonade.Application.Services;

public class UserService : IUserService
{
    private readonly DbContext _dbContext;
    private readonly IMapper _mapper;

    public UserService(DbContext dbContext, IMapper mapper)
    {
        _dbContext = dbContext;
        _mapper = mapper;
    }

    public async Task<UserDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Set<User>()
            .Include(u => u.UserBranches)
                .ThenInclude(ub => ub.Branch)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

        return user is null ? null : MapToDto(user);
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var users = await _dbContext.Set<User>()
            .Include(u => u.UserBranches)
                .ThenInclude(ub => ub.Branch)
            .ToListAsync(cancellationToken);

        return users.Select(MapToDto);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default)
    {
        var user = new User
        {
            Login = dto.Login,
            PasswordHash = HashPassword(dto.Password),
            Role = dto.Role,
            Scope = dto.Scope,
            IsBlocked = false,
            FailedAttempts = 0,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<User>().Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Add branch assignments
        if (dto.BranchIds.Count > 0)
        {
            foreach (var branchId in dto.BranchIds)
            {
                _dbContext.Set<UserBranch>().Add(new UserBranch
                {
                    UserId = user.Id,
                    BranchId = branchId,
                    CreatedAt = DateTime.UtcNow
                });
            }
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        // Reload with branches
        return (await GetByIdAsync(user.Id, cancellationToken))!;
    }

    public async Task<UserDto?> UpdateAsync(int id, UpdateUserDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Set<User>()
            .Include(u => u.UserBranches)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

        if (user is null) return null;

        user.Login = dto.Login;
        user.Role = dto.Role;
        user.Scope = dto.Scope;
        user.IsBlocked = dto.IsBlocked;
        user.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(dto.Password))
        {
            user.PasswordHash = HashPassword(dto.Password);
        }

        // Update branch assignments
        var currentBranchIds = user.UserBranches.Select(ub => ub.BranchId).ToList();
        var newBranchIds = dto.BranchIds;

        // Remove branches that are no longer assigned
        var branchesToRemove = user.UserBranches.Where(ub => !newBranchIds.Contains(ub.BranchId)).ToList();
        foreach (var ub in branchesToRemove)
        {
            _dbContext.Set<UserBranch>().Remove(ub);
        }

        // Add new branch assignments
        var branchesToAdd = newBranchIds.Where(bid => !currentBranchIds.Contains(bid)).ToList();
        foreach (var branchId in branchesToAdd)
        {
            _dbContext.Set<UserBranch>().Add(new UserBranch
            {
                UserId = user.Id,
                BranchId = branchId,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        // Reload with branches
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Set<User>().FindAsync([id], cancellationToken);
        if (user is null) return false;

        _dbContext.Set<User>().Remove(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    private static UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Login = user.Login,
            Role = user.Role,
            Scope = user.Scope,
            IsBlocked = user.IsBlocked,
            FailedAttempts = user.FailedAttempts,
            LastLogin = user.LastLogin,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            Branches = user.UserBranches.Select(ub => new UserBranchInfoDto
            {
                BranchId = ub.Branch.Id,
                BranchName = ub.Branch.Name,
                BranchCode = ub.Branch.Code
            }).ToList()
        };
    }
}
