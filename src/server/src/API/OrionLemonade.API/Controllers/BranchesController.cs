using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;

namespace OrionLemonade.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BranchesController : ControllerBase
{
    private readonly IBranchService _branchService;

    public BranchesController(IBranchService branchService)
    {
        _branchService = branchService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BranchDto>>> GetAll(CancellationToken cancellationToken)
    {
        var branches = await _branchService.GetAllAsync(cancellationToken);
        return Ok(branches);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BranchDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var branch = await _branchService.GetByIdAsync(id, cancellationToken);
        if (branch is null) return NotFound();
        return Ok(branch);
    }

    [HttpPost]
    public async Task<ActionResult<BranchDto>> Create(CreateBranchDto dto, CancellationToken cancellationToken)
    {
        var branch = await _branchService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = branch.Id }, branch);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<BranchDto>> Update(int id, UpdateBranchDto dto, CancellationToken cancellationToken)
    {
        var branch = await _branchService.UpdateAsync(id, dto, cancellationToken);
        if (branch is null) return NotFound();
        return Ok(branch);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _branchService.DeleteAsync(id, cancellationToken);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
