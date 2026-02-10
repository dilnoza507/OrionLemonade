using OrionLemonade.Domain.Common;

namespace OrionLemonade.Domain.Entities;

public class ExpenseCategory : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsSystem { get; set; }

    // Navigation properties
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}
