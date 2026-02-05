using OrionLemonade.Domain.Common;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class Branch : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public int? ManagerId { get; set; }
    public BranchStatus Status { get; set; } = BranchStatus.Active;
}
