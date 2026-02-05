namespace OrionLemonade.Application.DTOs;

public class UserBranchDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int BranchId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateUserBranchDto
{
    public int UserId { get; set; }
    public int BranchId { get; set; }
}
