using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;

namespace OrionLemonade.API.Controllers;

[ApiController]
[Route("api/expenses")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }

    #region Categories

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<ExpenseCategoryDto>>> GetCategories()
    {
        var categories = await _expenseService.GetCategoriesAsync();
        return Ok(categories);
    }

    [HttpGet("categories/{id}")]
    public async Task<ActionResult<ExpenseCategoryDto>> GetCategory(int id)
    {
        var category = await _expenseService.GetCategoryByIdAsync(id);
        if (category == null)
            return NotFound();
        return Ok(category);
    }

    [HttpPost("categories")]
    public async Task<ActionResult<ExpenseCategoryDto>> CreateCategory([FromBody] CreateExpenseCategoryDto dto)
    {
        var category = await _expenseService.CreateCategoryAsync(dto);
        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
    }

    [HttpPut("categories/{id}")]
    public async Task<ActionResult<ExpenseCategoryDto>> UpdateCategory(int id, [FromBody] UpdateExpenseCategoryDto dto)
    {
        var category = await _expenseService.UpdateCategoryAsync(id, dto);
        if (category == null)
            return NotFound();
        return Ok(category);
    }

    [HttpDelete("categories/{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var deleted = await _expenseService.DeleteCategoryAsync(id);
        if (!deleted)
            return NotFound();
        return NoContent();
    }

    #endregion

    #region Expenses

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetExpenses(
        [FromQuery] int? branchId,
        [FromQuery] int? categoryId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var expenses = await _expenseService.GetExpensesAsync(branchId, categoryId, from, to);
        return Ok(expenses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseDto>> GetExpense(int id)
    {
        var expense = await _expenseService.GetExpenseByIdAsync(id);
        if (expense == null)
            return NotFound();
        return Ok(expense);
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> CreateExpense([FromBody] CreateExpenseDto dto)
    {
        var userId = GetUserId();
        var expense = await _expenseService.CreateExpenseAsync(dto, userId);
        return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, expense);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ExpenseDto>> UpdateExpense(int id, [FromBody] UpdateExpenseDto dto)
    {
        var expense = await _expenseService.UpdateExpenseAsync(id, dto);
        if (expense == null)
            return NotFound();
        return Ok(expense);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpense(int id)
    {
        var deleted = await _expenseService.DeleteExpenseAsync(id);
        if (!deleted)
            return NotFound();
        return NoContent();
    }

    #endregion

    #region Summary

    [HttpGet("summary")]
    public async Task<ActionResult<IEnumerable<ExpenseSummaryDto>>> GetSummary(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var summary = await _expenseService.GetSummaryAsync(from, to);
        return Ok(summary);
    }

    #endregion
}
