using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using OrionLemonade.Application.DTOs.Auth;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Application.Settings;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Interfaces;

namespace OrionLemonade.Application.Services;

public class AuthService : IAuthService
{
    private readonly IRepository<User> _userRepository;
    private readonly JwtSettings _jwtSettings;

    public AuthService(IRepository<User> userRepository, IOptions<JwtSettings> jwtSettings)
    {
        _userRepository = userRepository;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<TokenDto?> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.FindAsync(u => u.Login == dto.Login, cancellationToken);
        var user = users.FirstOrDefault();

        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            if (user is not null)
            {
                user.FailedAttempts++;
                if (user.FailedAttempts >= 5)
                    user.IsBlocked = true;
                await _userRepository.UpdateAsync(user, cancellationToken);
                await _userRepository.SaveChangesAsync(cancellationToken);
            }
            return null;
        }

        if (user.IsBlocked)
            return null;

        user.FailedAttempts = 0;
        user.LastLogin = DateTime.UtcNow;
        user.RefreshToken = GenerateRefreshToken();
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);

        await _userRepository.UpdateAsync(user, cancellationToken);
        await _userRepository.SaveChangesAsync(cancellationToken);

        var accessToken = GenerateAccessToken(user);
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);

        return new TokenDto(accessToken, user.RefreshToken, expiresAt);
    }

    public async Task<TokenDto?> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.FindAsync(
            u => u.RefreshToken == refreshToken && u.RefreshTokenExpiry > DateTime.UtcNow,
            cancellationToken);
        var user = users.FirstOrDefault();

        if (user is null || user.IsBlocked)
            return null;

        user.RefreshToken = GenerateRefreshToken();
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);

        await _userRepository.UpdateAsync(user, cancellationToken);
        await _userRepository.SaveChangesAsync(cancellationToken);

        var accessToken = GenerateAccessToken(user);
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);

        return new TokenDto(accessToken, user.RefreshToken, expiresAt);
    }

    private string GenerateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Login),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("scope", user.Scope.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
