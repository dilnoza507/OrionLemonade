using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Services;

public class ExpenseService : IExpenseService
{
    private readonly DbContext _context;

    public ExpenseService(DbContext context)
    {
        _context = context;
    }

    #region Categories

    public async Task<IEnumerable<ExpenseCategoryDto>> GetCategoriesAsync()
    {
        var categories = await _context.Set<ExpenseCategory>()
            .OrderBy(c => c.Name)
            .ToListAsync();

        return categories.Select(MapCategoryToDto);
    }

    public async Task<ExpenseCategoryDto?> GetCategoryByIdAsync(int id)
    {
        var category = await _context.Set<ExpenseCategory>().FindAsync(id);
        return category is null ? null : MapCategoryToDto(category);
    }

    public async Task<ExpenseCategoryDto> CreateCategoryAsync(CreateExpenseCategoryDto dto)
    {
        var category = new ExpenseCategory
        {
            Name = dto.Name,
            Description = dto.Description,
            IsSystem = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<ExpenseCategory>().Add(category);
        await _context.SaveChangesAsync();

        return MapCategoryToDto(category);
    }

    public async Task<ExpenseCategoryDto?> UpdateCategoryAsync(int id, UpdateExpenseCategoryDto dto)
    {
        var category = await _context.Set<ExpenseCategory>().FindAsync(id);
        if (category is null) return null;
        if (category.IsSystem) return null; // Cannot edit system categories

        category.Name = dto.Name;
        category.Description = dto.Description;

        await _context.SaveChangesAsync();

        return MapCategoryToDto(category);
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await _context.Set<ExpenseCategory>()
            .Include(c => c.Expenses)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category is null) return false;
        if (category.IsSystem) return false; // Cannot delete system categories
        if (category.Expenses.Any()) return false; // Cannot delete if has expenses

        _context.Set<ExpenseCategory>().Remove(category);
        await _context.SaveChangesAsync();

        return true;
    }

    #endregion

    #region Expenses

    public async Task<IEnumerable<ExpenseDto>> GetExpensesAsync(int? branchId = null, int? categoryId = null, DateTime? from = null, DateTime? to = null)
    {
        var query = _context.Set<Expense>()
            .Include(e => e.Branch)
            .Include(e => e.Category)
            .Include(e => e.CreatedByUser)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(e => e.BranchId == branchId.Value);

        if (categoryId.HasValue)
            query = query.Where(e => e.CategoryId == categoryId.Value);

        if (from.HasValue)
            query = query.Where(e => e.ExpenseDate >= from.Value);

        if (to.HasValue)
            query = query.Where(e => e.ExpenseDate <= to.Value);

        var expenses = await query
            .OrderByDescending(e => e.ExpenseDate)
            .ThenByDescending(e => e.CreatedAt)
            .ToListAsync();

        return expenses.Select(MapToDto);
    }

    public async Task<ExpenseDto?> GetExpenseByIdAsync(int id)
    {
        var expense = await _context.Set<Expense>()
            .Include(e => e.Branch)
            .Include(e => e.Category)
            .Include(e => e.CreatedByUser)
            .FirstOrDefaultAsync(e => e.Id == id);

        return expense is null ? null : MapToDto(expense);
    }

    public async Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto dto, int userId)
    {
        var exchangeRate = dto.ExchangeRate ?? await GetCurrentExchangeRateAsync();
        var amountTjs = dto.Currency == ExpenseCurrency.USD
            ? dto.AmountOriginal * exchangeRate
            : dto.AmountOriginal;

        var expense = new Expense
        {
            BranchId = dto.BranchId,
            ExpenseDate = dto.ExpenseDate,
            CategoryId = dto.CategoryId,
            Currency = dto.Currency,
            AmountOriginal = dto.AmountOriginal,
            ExchangeRate = exchangeRate,
            AmountTjs = amountTjs,
            Comment = dto.Comment,
            IsRecurring = dto.IsRecurring,
            RecurrencePeriod = dto.RecurrencePeriod,
            Source = ExpenseSource.Manual,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<Expense>().Add(expense);
        await _context.SaveChangesAsync();

        return (await GetExpenseByIdAsync(expense.Id))!;
    }

    public async Task<ExpenseDto?> UpdateExpenseAsync(int id, UpdateExpenseDto dto)
    {
        var expense = await _context.Set<Expense>().FindAsync(id);
        if (expense is null) return null;

        var exchangeRate = dto.ExchangeRate ?? expense.ExchangeRate;
        var amountTjs = dto.Currency == ExpenseCurrency.USD
            ? dto.AmountOriginal * exchangeRate
            : dto.AmountOriginal;

        expense.BranchId = dto.BranchId;
        expense.ExpenseDate = dto.ExpenseDate;
        expense.CategoryId = dto.CategoryId;
        expense.Currency = dto.Currency;
        expense.AmountOriginal = dto.AmountOriginal;
        expense.ExchangeRate = exchangeRate;
        expense.AmountTjs = amountTjs;
        expense.Comment = dto.Comment;
        expense.IsRecurring = dto.IsRecurring;
        expense.RecurrencePeriod = dto.RecurrencePeriod;

        await _context.SaveChangesAsync();

        return await GetExpenseByIdAsync(id);
    }

    public async Task<bool> DeleteExpenseAsync(int id)
    {
        var expense = await _context.Set<Expense>().FindAsync(id);
        if (expense is null) return false;

        _context.Set<Expense>().Remove(expense);
        await _context.SaveChangesAsync();

        return true;
    }

    #endregion

    #region Summary

    public async Task<IEnumerable<ExpenseSummaryDto>> GetSummaryAsync(DateTime? from = null, DateTime? to = null)
    {
        var query = _context.Set<Expense>()
            .Include(e => e.Branch)
            .Include(e => e.Category)
            .AsQueryable();

        if (from.HasValue)
            query = query.Where(e => e.ExpenseDate >= from.Value);

        if (to.HasValue)
            query = query.Where(e => e.ExpenseDate <= to.Value);

        var expenses = await query.ToListAsync();

        var summary = expenses
            .GroupBy(e => new { e.BranchId, BranchName = e.Branch?.Name })
            .Select(g => new ExpenseSummaryDto
            {
                BranchId = g.Key.BranchId,
                BranchName = g.Key.BranchName ?? "Общие расходы",
                TotalCount = g.Count(),
                TotalAmountTjs = g.Sum(e => e.AmountTjs),
                ByCategory = g
                    .GroupBy(e => new { e.CategoryId, e.Category.Name })
                    .Select(cg => new CategorySummaryDto
                    {
                        CategoryId = cg.Key.CategoryId,
                        CategoryName = cg.Key.Name,
                        Count = cg.Count(),
                        AmountTjs = cg.Sum(e => e.AmountTjs)
                    })
                    .OrderByDescending(c => c.AmountTjs)
                    .ToList()
            })
            .OrderByDescending(s => s.TotalAmountTjs)
            .ToList();

        return summary;
    }

    #endregion

    #region Helpers

    private async Task<decimal> GetCurrentExchangeRateAsync()
    {
        var rate = await _context.Set<ExchangeRate>()
            .OrderByDescending(r => r.RateDate)
            .FirstOrDefaultAsync();
        return rate?.Rate ?? 10.5m;
    }

    private static ExpenseCategoryDto MapCategoryToDto(ExpenseCategory category)
    {
        return new ExpenseCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            IsSystem = category.IsSystem,
            CreatedAt = category.CreatedAt
        };
    }

    private static ExpenseDto MapToDto(Expense expense)
    {
        return new ExpenseDto
        {
            Id = expense.Id,
            BranchId = expense.BranchId,
            BranchName = expense.Branch?.Name,
            ExpenseDate = expense.ExpenseDate,
            CategoryId = expense.CategoryId,
            CategoryName = expense.Category?.Name ?? string.Empty,
            Currency = expense.Currency,
            CurrencyName = expense.Currency.ToString(),
            AmountOriginal = expense.AmountOriginal,
            ExchangeRate = expense.ExchangeRate,
            AmountTjs = expense.AmountTjs,
            Comment = expense.Comment,
            IsRecurring = expense.IsRecurring,
            RecurrencePeriod = expense.RecurrencePeriod,
            RecurrencePeriodName = expense.RecurrencePeriod?.ToString(),
            Source = expense.Source,
            SourceName = GetSourceName(expense.Source),
            SourceDocumentId = expense.SourceDocumentId,
            CreatedByUserId = expense.CreatedByUserId,
            CreatedByUserLogin = expense.CreatedByUser?.Login,
            CreatedAt = expense.CreatedAt
        };
    }

    private static string GetSourceName(ExpenseSource source)
    {
        return source switch
        {
            ExpenseSource.Manual => "Вручную",
            ExpenseSource.AutoReceipt => "Авто (поступление)",
            ExpenseSource.AutoPayroll => "Авто (зарплата)",
            _ => source.ToString()
        };
    }

    #endregion
}
