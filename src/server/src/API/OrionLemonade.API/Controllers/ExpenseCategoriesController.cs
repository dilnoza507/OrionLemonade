using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;

namespace OrionLemonade.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ExpenseCategoriesController : ControllerBase
{
    private readonly IExpenseCategoryService _expenseCategoryService;

    public ExpenseCategoriesController(IExpenseCategoryService expenseCategoryService)
    {
        _expenseCategoryService = expenseCategoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseCategoryDto>>> GetAll(CancellationToken cancellationToken)
    {
        var categories = await _expenseCategoryService.GetAllAsync(cancellationToken);
        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseCategoryDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var category = await _expenseCategoryService.GetByIdAsync(id, cancellationToken);
        if (category is null) return NotFound();
        return Ok(category);
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseCategoryDto>> Create(CreateExpenseCategoryDto dto, CancellationToken cancellationToken)
    {
        var category = await _expenseCategoryService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ExpenseCategoryDto>> Update(int id, UpdateExpenseCategoryDto dto, CancellationToken cancellationToken)
    {
        var category = await _expenseCategoryService.UpdateAsync(id, dto, cancellationToken);
        if (category is null) return NotFound();
        return Ok(category);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _expenseCategoryService.DeleteAsync(id, cancellationToken);
        if (!deleted) return BadRequest("Cannot delete system category or category not found");
        return NoContent();
    }
}
