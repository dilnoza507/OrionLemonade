using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Services;

public class ClientService : IClientService
{
    private readonly DbContext _dbContext;

    public ClientService(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ClientDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<Client>()
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        return entity is null ? null : MapToDto(entity);
    }

    public async Task<IEnumerable<ClientDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<Client>()
            .OrderBy(e => e.Name)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto);
    }

    public async Task<IEnumerable<ClientDto>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<Client>()
            .Where(e => e.Status == ClientStatus.Active)
            .OrderBy(e => e.Name)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto);
    }

    public async Task<ClientDto> CreateAsync(CreateClientDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new Client
        {
            Name = dto.Name,
            ContactPerson = dto.ContactPerson,
            Phone = dto.Phone,
            Email = dto.Email,
            Address = dto.Address,
            Notes = dto.Notes,
            Status = ClientStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<Client>().Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<ClientDto?> UpdateAsync(int id, UpdateClientDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<Client>().FindAsync([id], cancellationToken);
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
        var entity = await _dbContext.Set<Client>().FindAsync([id], cancellationToken);
        if (entity is null) return false;

        _dbContext.Set<Client>().Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static ClientDto MapToDto(Client entity)
    {
        return new ClientDto
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
