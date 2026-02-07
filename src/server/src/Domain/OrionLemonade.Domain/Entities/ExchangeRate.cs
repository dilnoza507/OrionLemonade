using OrionLemonade.Domain.Common;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class ExchangeRate : BaseEntity
{
    public DateOnly RateDate { get; set; }
    public CurrencyPair CurrencyPair { get; set; }
    public decimal Rate { get; set; }
    public ExchangeRateSource Source { get; set; }
    public int? SetByUserId { get; set; }
    public User? SetByUser { get; set; }
}
