using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;

namespace OrionLemonade.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class IngredientsController : ControllerBase
{
    private readonly IIngredientService _ingredientService;

    public IngredientsController(IIngredientService ingredientService)
    {
        _ingredientService = ingredientService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<IngredientDto>>> GetAll(CancellationToken cancellationToken)
    {
        var ingredients = await _ingredientService.GetAllAsync(cancellationToken);
        return Ok(ingredients);
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<IngredientDto>>> GetActive(CancellationToken cancellationToken)
    {
        var ingredients = await _ingredientService.GetActiveAsync(cancellationToken);
        return Ok(ingredients);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<IngredientDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var ingredient = await _ingredientService.GetByIdAsync(id, cancellationToken);
        if (ingredient is null) return NotFound();
        return Ok(ingredient);
    }

    [HttpPost]
    public async Task<ActionResult<IngredientDto>> Create(CreateIngredientDto dto, CancellationToken cancellationToken)
    {
        var ingredient = await _ingredientService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = ingredient.Id }, ingredient);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<IngredientDto>> Update(int id, UpdateIngredientDto dto, CancellationToken cancellationToken)
    {
        var ingredient = await _ingredientService.UpdateAsync(id, dto, cancellationToken);
        if (ingredient is null) return NotFound();
        return Ok(ingredient);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _ingredientService.DeleteAsync(id, cancellationToken);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
