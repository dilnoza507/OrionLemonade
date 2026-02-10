using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class Expense
{
    public int Id { get; set; }
    public int? BranchId { get; set; }
    public DateTime ExpenseDate { get; set; }
    public int CategoryId { get; set; }
    public ExpenseCurrency Currency { get; set; }
    public decimal AmountOriginal { get; set; }
    public decimal ExchangeRate { get; set; }
    public decimal AmountTjs { get; set; }
    public string? Comment { get; set; }
    public bool IsRecurring { get; set; }
    public RecurrencePeriod? RecurrencePeriod { get; set; }
    public ExpenseSource Source { get; set; } = ExpenseSource.Manual;
    public int? SourceDocumentId { get; set; }
    public int? CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Branch? Branch { get; set; }
    public ExpenseCategory Category { get; set; } = null!;
    public User? CreatedByUser { get; set; }
}
