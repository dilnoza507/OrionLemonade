using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.Application.DTOs.Auth;
using OrionLemonade.Application.Interfaces;

namespace OrionLemonade.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
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
    public ActionResult GetCurrentUser()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var login = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var scope = User.FindFirst("scope")?.Value;

        return Ok(new { userId, login, role, scope });
    }
}
