using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using System.Security.Claims;

namespace OrionLemonade.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RecipesController : ControllerBase
{
    private readonly IRecipeService _recipeService;

    public RecipesController(IRecipeService recipeService)
    {
        _recipeService = recipeService;
    }

    #region Recipe Endpoints

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RecipeDto>>> GetAll(CancellationToken cancellationToken)
    {
        var recipes = await _recipeService.GetAllAsync(cancellationToken);
        return Ok(recipes);
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<RecipeDto>>> GetActive(CancellationToken cancellationToken)
    {
        var recipes = await _recipeService.GetActiveAsync(cancellationToken);
        return Ok(recipes);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RecipeDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var recipe = await _recipeService.GetByIdAsync(id, cancellationToken);
        if (recipe is null) return NotFound();
        return Ok(recipe);
    }

    [HttpGet("{id}/detail")]
    public async Task<ActionResult<RecipeDetailDto>> GetDetail(int id, CancellationToken cancellationToken)
    {
        var recipe = await _recipeService.GetDetailByIdAsync(id, cancellationToken);
        if (recipe is null) return NotFound();
        return Ok(recipe);
    }

    [HttpPost]
    public async Task<ActionResult<RecipeDto>> Create(CreateRecipeDto dto, CancellationToken cancellationToken)
    {
        var recipe = await _recipeService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = recipe.Id }, recipe);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<RecipeDto>> Update(int id, UpdateRecipeDto dto, CancellationToken cancellationToken)
    {
        var recipe = await _recipeService.UpdateAsync(id, dto, cancellationToken);
        if (recipe is null) return NotFound();
        return Ok(recipe);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _recipeService.DeleteAsync(id, cancellationToken);
        if (!deleted) return NotFound();
        return NoContent();
    }

    #endregion

    #region RecipeVersion Endpoints

    [HttpGet("versions/{versionId}")]
    public async Task<ActionResult<RecipeVersionDto>> GetVersion(int versionId, CancellationToken cancellationToken)
    {
        var version = await _recipeService.GetVersionByIdAsync(versionId, cancellationToken);
        if (version is null) return NotFound();
        return Ok(version);
    }

    [HttpPost("versions")]
    public async Task<ActionResult<RecipeVersionDto>> CreateVersion(CreateRecipeVersionDto dto, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var version = await _recipeService.CreateVersionAsync(dto, userId, cancellationToken);
        return CreatedAtAction(nameof(GetVersion), new { versionId = version.Id }, version);
    }

    [HttpPut("versions/{versionId}")]
    public async Task<ActionResult<RecipeVersionDto>> UpdateVersion(int versionId, UpdateRecipeVersionDto dto, CancellationToken cancellationToken)
    {
        var version = await _recipeService.UpdateVersionAsync(versionId, dto, cancellationToken);
        if (version is null) return NotFound();
        return Ok(version);
    }

    [HttpPost("versions/{versionId}/activate")]
    public async Task<IActionResult> ActivateVersion(int versionId, CancellationToken cancellationToken)
    {
        var activated = await _recipeService.ActivateVersionAsync(versionId, cancellationToken);
        if (!activated) return NotFound();
        return Ok();
    }

    [HttpDelete("versions/{versionId}")]
    public async Task<IActionResult> DeleteVersion(int versionId, CancellationToken cancellationToken)
    {
        var deleted = await _recipeService.DeleteVersionAsync(versionId, cancellationToken);
        if (!deleted) return BadRequest("Cannot delete active version or version not found");
        return NoContent();
    }

    #endregion
}
