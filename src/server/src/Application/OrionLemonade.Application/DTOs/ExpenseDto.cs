using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

public class ExpenseDto
{
    public int Id { get; set; }
    public int? BranchId { get; set; }
    public string? BranchName { get; set; }
    public DateTime ExpenseDate { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public ExpenseCurrency Currency { get; set; }
    public string CurrencyName { get; set; } = string.Empty;
    public decimal AmountOriginal { get; set; }
    public decimal ExchangeRate { get; set; }
    public decimal AmountTjs { get; set; }
    public string? Comment { get; set; }
    public bool IsRecurring { get; set; }
    public RecurrencePeriod? RecurrencePeriod { get; set; }
    public string? RecurrencePeriodName { get; set; }
    public ExpenseSource Source { get; set; }
    public string SourceName { get; set; } = string.Empty;
    public int? SourceDocumentId { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserLogin { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateExpenseDto
{
    public int? BranchId { get; set; }
    public DateTime ExpenseDate { get; set; }
    public int CategoryId { get; set; }
    public ExpenseCurrency Currency { get; set; }
    public decimal AmountOriginal { get; set; }
    public decimal? ExchangeRate { get; set; }
    public string? Comment { get; set; }
    public bool IsRecurring { get; set; }
    public RecurrencePeriod? RecurrencePeriod { get; set; }
}

public class UpdateExpenseDto
{
    public int? BranchId { get; set; }
    public DateTime ExpenseDate { get; set; }
    public int CategoryId { get; set; }
    public ExpenseCurrency Currency { get; set; }
    public decimal AmountOriginal { get; set; }
    public decimal? ExchangeRate { get; set; }
    public string? Comment { get; set; }
    public bool IsRecurring { get; set; }
    public RecurrencePeriod? RecurrencePeriod { get; set; }
}

// Summary DTOs
public class ExpenseSummaryDto
{
    public int? BranchId { get; set; }
    public string? BranchName { get; set; }
    public int TotalCount { get; set; }
    public decimal TotalAmountTjs { get; set; }
    public List<CategorySummaryDto> ByCategory { get; set; } = new();
}

public class CategorySummaryDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal AmountTjs { get; set; }
}
