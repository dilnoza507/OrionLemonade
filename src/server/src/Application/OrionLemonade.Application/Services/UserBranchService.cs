using AutoMapper;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Interfaces;

namespace OrionLemonade.Application.Services;

public class UserBranchService : IUserBranchService
{
    private readonly IRepository<UserBranch> _repository;
    private readonly IMapper _mapper;

    public UserBranchService(IRepository<UserBranch> repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<UserBranchDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var userBranch = await _repository.GetByIdAsync(id, cancellationToken);
        return userBranch is null ? null : _mapper.Map<UserBranchDto>(userBranch);
    }

    public async Task<IEnumerable<UserBranchDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var userBranches = await _repository.GetAllAsync(cancellationToken);
        return _mapper.Map<IEnumerable<UserBranchDto>>(userBranches);
    }

    public async Task<IEnumerable<UserBranchDto>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        var userBranches = await _repository.FindAsync(ub => ub.UserId == userId, cancellationToken);
        return _mapper.Map<IEnumerable<UserBranchDto>>(userBranches);
    }

    public async Task<UserBranchDto> CreateAsync(CreateUserBranchDto dto, CancellationToken cancellationToken = default)
    {
        var userBranch = _mapper.Map<UserBranch>(dto);
        await _repository.AddAsync(userBranch, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return _mapper.Map<UserBranchDto>(userBranch);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var userBranch = await _repository.GetByIdAsync(id, cancellationToken);
        if (userBranch is null) return false;

        await _repository.DeleteAsync(userBranch, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return true;
    }
}
