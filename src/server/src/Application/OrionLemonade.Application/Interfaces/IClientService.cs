using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface IClientService
{
    Task<ClientDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ClientDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<ClientDto>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<ClientDto> CreateAsync(CreateClientDto dto, CancellationToken cancellationToken = default);
    Task<ClientDto?> UpdateAsync(int id, UpdateClientDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
