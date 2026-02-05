namespace OrionLemonade.Application.DTOs.Auth;

public record TokenDto(string AccessToken, string RefreshToken, DateTime ExpiresAt);
