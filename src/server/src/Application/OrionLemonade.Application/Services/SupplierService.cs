using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Services;

public class SupplierService : ISupplierService
{
    private readonly DbContext _dbContext;

    public SupplierService(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<SupplierDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<Supplier>()
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        return entity is null ? null : MapToDto(entity);
    }

    public async Task<IEnumerable<SupplierDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<Supplier>()
            .OrderBy(e => e.Name)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto);
    }

    public async Task<IEnumerable<SupplierDto>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<Supplier>()
            .Where(e => e.Status == SupplierStatus.Active)
            .OrderBy(e => e.Name)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto);
    }

    public async Task<SupplierDto> CreateAsync(CreateSupplierDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new Supplier
        {
            Name = dto.Name,
            ContactPerson = dto.ContactPerson,
            Phone = dto.Phone,
            Email = dto.Email,
            Address = dto.Address,
            Notes = dto.Notes,
            Status = SupplierStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<Supplier>().Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<SupplierDto?> UpdateAsync(int id, UpdateSupplierDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<Supplier>().FindAsync([id], cancellationToken);
        if (entity is null) return null;

        entity.Name = dto.Name;
        entity.ContactPerson = dto.ContactPerson;
        entity.Phone = dto.Phone;
        entity.Email = dto.Email;
        entity.Address = dto.Address;
        entity.Notes = dto.Notes;
        entity.Status = dto.Status;
        entity.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<Supplier>().FindAsync([id], cancellationToken);
        if (entity is null) return false;

        _dbContext.Set<Supplier>().Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static SupplierDto MapToDto(Supplier entity)
    {
        return new SupplierDto
        {
            Id = entity.Id,
            Name = entity.Name,
            ContactPerson = entity.ContactPerson,
            Phone = entity.Phone,
            Email = entity.Email,
            Address = entity.Address,
            Notes = entity.Notes,
            Status = entity.Status,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
