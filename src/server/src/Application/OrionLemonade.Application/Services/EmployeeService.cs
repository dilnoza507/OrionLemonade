using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Services;

public class EmployeeService : IEmployeeService
{
    private readonly DbContext _dbContext;

    public EmployeeService(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<EmployeeDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<Employee>()
            .Include(e => e.Branch)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        return entity is null ? null : MapToDto(entity);
    }

    public async Task<IEnumerable<EmployeeDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<Employee>()
            .Include(e => e.Branch)
            .OrderBy(e => e.FullName)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto);
    }

    public async Task<IEnumerable<EmployeeDto>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<Employee>()
            .Include(e => e.Branch)
            .Where(e => e.Status == EmployeeStatus.Active)
            .OrderBy(e => e.FullName)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto);
    }

    public async Task<IEnumerable<EmployeeDto>> GetByBranchAsync(int branchId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<Employee>()
            .Include(e => e.Branch)
            .Where(e => e.BranchId == branchId)
            .OrderBy(e => e.FullName)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto);
    }

    public async Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new Employee
        {
            FullName = dto.FullName,
            Position = dto.Position,
            Phone = dto.Phone,
            HireDate = dto.HireDate,
            HourlyRate = dto.HourlyRate,
            MonthlyRate = dto.MonthlyRate,
            BranchId = dto.BranchId,
            Status = EmployeeStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<Employee>().Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Load branch for response
        if (entity.BranchId.HasValue)
        {
            await _dbContext.Entry(entity).Reference(e => e.Branch).LoadAsync(cancellationToken);
        }

        return MapToDto(entity);
    }

    public async Task<EmployeeDto?> UpdateAsync(int id, UpdateEmployeeDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<Employee>()
            .Include(e => e.Branch)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        if (entity is null) return null;

        entity.FullName = dto.FullName;
        entity.Position = dto.Position;
        entity.Phone = dto.Phone;
        entity.HireDate = dto.HireDate;
        entity.HourlyRate = dto.HourlyRate;
        entity.MonthlyRate = dto.MonthlyRate;
        entity.BranchId = dto.BranchId;
        entity.Status = dto.Status;
        entity.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        // Reload branch if changed
        if (entity.BranchId.HasValue)
        {
            await _dbContext.Entry(entity).Reference(e => e.Branch).LoadAsync(cancellationToken);
        }

        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<Employee>().FindAsync([id], cancellationToken);
        if (entity is null) return false;

        _dbContext.Set<Employee>().Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static EmployeeDto MapToDto(Employee entity)
    {
        return new EmployeeDto
        {
            Id = entity.Id,
            FullName = entity.FullName,
            Position = entity.Position,
            Phone = entity.Phone,
            HireDate = entity.HireDate,
            HourlyRate = entity.HourlyRate,
            MonthlyRate = entity.MonthlyRate,
            BranchId = entity.BranchId,
            BranchName = entity.Branch?.Name,
            Status = entity.Status,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
