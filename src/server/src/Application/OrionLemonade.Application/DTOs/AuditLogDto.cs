using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

public class AuditLogDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserLogin { get; set; } = string.Empty;
    public DateTime ActionTime { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string Action { get; set; } = string.Empty;
    public int? BranchId { get; set; }
    public string? BranchName { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
}
