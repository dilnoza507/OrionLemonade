using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface IExpenseService
{
    // Categories
    Task<IEnumerable<ExpenseCategoryDto>> GetCategoriesAsync();
    Task<ExpenseCategoryDto?> GetCategoryByIdAsync(int id);
    Task<ExpenseCategoryDto> CreateCategoryAsync(CreateExpenseCategoryDto dto);
    Task<ExpenseCategoryDto?> UpdateCategoryAsync(int id, UpdateExpenseCategoryDto dto);
    Task<bool> DeleteCategoryAsync(int id);

    // Expenses
    Task<IEnumerable<ExpenseDto>> GetExpensesAsync(int? branchId = null, int? categoryId = null, DateTime? from = null, DateTime? to = null);
    Task<ExpenseDto?> GetExpenseByIdAsync(int id);
    Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto dto, int userId);
    Task<ExpenseDto?> UpdateExpenseAsync(int id, UpdateExpenseDto dto);
    Task<bool> DeleteExpenseAsync(int id);

    // Summary
    Task<IEnumerable<ExpenseSummaryDto>> GetSummaryAsync(DateTime? from = null, DateTime? to = null);
}
