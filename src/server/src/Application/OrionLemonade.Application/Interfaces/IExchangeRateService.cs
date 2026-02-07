using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface IExchangeRateService
{
    Task<ExchangeRateDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ExchangeRateDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ExchangeRateDto?> GetLatestAsync(CancellationToken cancellationToken = default);
    Task<ExchangeRateDto?> GetByDateAsync(DateOnly date, CancellationToken cancellationToken = default);
    Task<ExchangeRateDto> CreateAsync(CreateExchangeRateDto dto, int userId, CancellationToken cancellationToken = default);
    Task<ExchangeRateDto?> UpdateAsync(int id, UpdateExchangeRateDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
