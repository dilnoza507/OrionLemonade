using OrionLemonade.Application.DTOs.Auth;

namespace OrionLemonade.Application.Interfaces;

public interface IAuthService
{
    Task<TokenDto?> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default);
    Task<TokenDto?> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
}
