using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;

namespace OrionLemonade.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserBranchesController : ControllerBase
{
    private readonly IUserBranchService _userBranchService;

    public UserBranchesController(IUserBranchService userBranchService)
    {
        _userBranchService = userBranchService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserBranchDto>>> GetAll(CancellationToken cancellationToken)
    {
        var userBranches = await _userBranchService.GetAllAsync(cancellationToken);
        return Ok(userBranches);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserBranchDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var userBranch = await _userBranchService.GetByIdAsync(id, cancellationToken);
        if (userBranch is null) return NotFound();
        return Ok(userBranch);
    }

    [HttpGet("by-user/{userId}")]
    public async Task<ActionResult<IEnumerable<UserBranchDto>>> GetByUserId(int userId, CancellationToken cancellationToken)
    {
        var userBranches = await _userBranchService.GetByUserIdAsync(userId, cancellationToken);
        return Ok(userBranches);
    }

    [HttpPost]
    public async Task<ActionResult<UserBranchDto>> Create(CreateUserBranchDto dto, CancellationToken cancellationToken)
    {
        var userBranch = await _userBranchService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = userBranch.Id }, userBranch);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _userBranchService.DeleteAsync(id, cancellationToken);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
