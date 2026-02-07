using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;

namespace OrionLemonade.Application.Services;

public class ExchangeRateService : IExchangeRateService
{
    private readonly DbContext _dbContext;

    public ExchangeRateService(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ExchangeRateDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ExchangeRate>()
            .Include(e => e.SetByUser)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        return entity is null ? null : MapToDto(entity);
    }

    public async Task<IEnumerable<ExchangeRateDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ExchangeRate>()
            .Include(e => e.SetByUser)
            .OrderByDescending(e => e.RateDate)
            .ThenByDescending(e => e.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto);
    }

    public async Task<ExchangeRateDto?> GetLatestAsync(CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ExchangeRate>()
            .Include(e => e.SetByUser)
            .OrderByDescending(e => e.RateDate)
            .ThenByDescending(e => e.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        return entity is null ? null : MapToDto(entity);
    }

    public async Task<ExchangeRateDto?> GetByDateAsync(DateOnly date, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ExchangeRate>()
            .Include(e => e.SetByUser)
            .Where(e => e.RateDate == date)
            .OrderByDescending(e => e.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        return entity is null ? null : MapToDto(entity);
    }

    public async Task<ExchangeRateDto> CreateAsync(CreateExchangeRateDto dto, int userId, CancellationToken cancellationToken = default)
    {
        var entity = new ExchangeRate
        {
            RateDate = dto.RateDate,
            CurrencyPair = dto.CurrencyPair,
            Rate = dto.Rate,
            Source = dto.Source,
            SetByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<ExchangeRate>().Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<ExchangeRateDto?> UpdateAsync(int id, UpdateExchangeRateDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ExchangeRate>().FindAsync([id], cancellationToken);
        if (entity is null) return null;

        entity.RateDate = dto.RateDate;
        entity.CurrencyPair = dto.CurrencyPair;
        entity.Rate = dto.Rate;
        entity.Source = dto.Source;
        entity.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ExchangeRate>().FindAsync([id], cancellationToken);
        if (entity is null) return false;

        _dbContext.Set<ExchangeRate>().Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static ExchangeRateDto MapToDto(ExchangeRate entity)
    {
        return new ExchangeRateDto
        {
            Id = entity.Id,
            RateDate = entity.RateDate,
            CurrencyPair = entity.CurrencyPair,
            Rate = entity.Rate,
            Source = entity.Source,
            SetByUserId = entity.SetByUserId,
            SetByUserLogin = entity.SetByUser?.Login,
            CreatedAt = entity.CreatedAt
        };
    }
}
