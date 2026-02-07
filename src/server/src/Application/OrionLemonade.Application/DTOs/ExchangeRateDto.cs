using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

public class ExchangeRateDto
{
    public int Id { get; set; }
    public DateOnly RateDate { get; set; }
    public CurrencyPair CurrencyPair { get; set; }
    public decimal Rate { get; set; }
    public ExchangeRateSource Source { get; set; }
    public int? SetByUserId { get; set; }
    public string? SetByUserLogin { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateExchangeRateDto
{
    public DateOnly RateDate { get; set; }
    public CurrencyPair CurrencyPair { get; set; }
    public decimal Rate { get; set; }
    public ExchangeRateSource Source { get; set; }
}

public class UpdateExchangeRateDto
{
    public DateOnly RateDate { get; set; }
    public CurrencyPair CurrencyPair { get; set; }
    public decimal Rate { get; set; }
    public ExchangeRateSource Source { get; set; }
}
