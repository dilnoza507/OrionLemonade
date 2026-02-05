using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

public class UserDto
{
    public int Id { get; set; }
    public string Login { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public UserScope Scope { get; set; }
    public bool IsBlocked { get; set; }
    public int FailedAttempts { get; set; }
    public DateTime? LastLogin { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateUserDto
{
    public string Login { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public UserScope Scope { get; set; }
}

public class UpdateUserDto
{
    public string Login { get; set; } = string.Empty;
    public string? Password { get; set; }
    public UserRole Role { get; set; }
    public UserScope Scope { get; set; }
    public bool IsBlocked { get; set; }
}
