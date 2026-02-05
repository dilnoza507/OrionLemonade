using AutoMapper;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Interfaces;

namespace OrionLemonade.Application.Services;

public class BranchService : IBranchService
{
    private readonly IRepository<Branch> _repository;
    private readonly IMapper _mapper;

    public BranchService(IRepository<Branch> repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<BranchDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var branch = await _repository.GetByIdAsync(id, cancellationToken);
        return branch is null ? null : _mapper.Map<BranchDto>(branch);
    }

    public async Task<IEnumerable<BranchDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var branches = await _repository.GetAllAsync(cancellationToken);
        return _mapper.Map<IEnumerable<BranchDto>>(branches);
    }

    public async Task<BranchDto> CreateAsync(CreateBranchDto dto, CancellationToken cancellationToken = default)
    {
        var branch = _mapper.Map<Branch>(dto);
        await _repository.AddAsync(branch, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return _mapper.Map<BranchDto>(branch);
    }

    public async Task<BranchDto?> UpdateAsync(int id, UpdateBranchDto dto, CancellationToken cancellationToken = default)
    {
        var branch = await _repository.GetByIdAsync(id, cancellationToken);
        if (branch is null) return null;

        _mapper.Map(dto, branch);
        branch.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(branch, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return _mapper.Map<BranchDto>(branch);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var branch = await _repository.GetByIdAsync(id, cancellationToken);
        if (branch is null) return false;

        await _repository.DeleteAsync(branch, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return true;
    }
}
