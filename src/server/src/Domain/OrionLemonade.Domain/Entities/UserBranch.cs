using OrionLemonade.Domain.Common;

namespace OrionLemonade.Domain.Entities;

public class UserBranch : BaseEntity
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int BranchId { get; set; }
    public Branch Branch { get; set; } = null!;
}
