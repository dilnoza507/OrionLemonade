using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class AuditLog
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateTime ActionTime { get; set; } = DateTime.UtcNow;
    public string EntityType { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public AuditAction Action { get; set; }
    public int? BranchId { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Branch? Branch { get; set; }
}
