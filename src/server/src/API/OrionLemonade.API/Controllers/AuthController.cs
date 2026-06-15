using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs.Auth;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using System.Security.Claims;

namespace OrionLemonade.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly DbContext _dbContext;

    public AuthController(IAuthService authService, DbContext dbContext)
    {
        _authService = authService;
        _dbContext = dbContext;
    }

    [HttpPost("login")]
    public async Task<ActionResult<TokenDto>> Login(LoginDto dto, CancellationToken cancellationToken)
    {
        var token = await _authService.LoginAsync(dto, cancellationToken);
        if (token is null)
            return Unauthorized(new { message = "Неверный логин или пароль" });

        return Ok(token);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<TokenDto>> Refresh(RefreshTokenDto dto, CancellationToken cancellationToken)
    {
        var token = await _authService.RefreshTokenAsync(dto.RefreshToken, cancellationToken);
        if (token is null)
            return Unauthorized(new { message = "Недействительный refresh token" });

        return Ok(token);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult> GetCurrentUser(CancellationToken cancellationToken)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var login = User.FindFirst(ClaimTypes.Name)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var scope = User.FindFirst("scope")?.Value;

        var branches = new List<object>();
        if (int.TryParse(userIdStr, out var userId))
        {
            var userBranches = await _dbContext.Set<UserBranch>()
                .Include(ub => ub.Branch)
                .Where(ub => ub.UserId == userId)
                .ToListAsync(cancellationToken);

            branches = userBranches
                .Select(ub => (object)new { branchId = ub.BranchId, branchName = ub.Branch!.Name })
                .ToList();
        }

        return Ok(new { userId = userIdStr, login, role, scope, branches });
    }
}
