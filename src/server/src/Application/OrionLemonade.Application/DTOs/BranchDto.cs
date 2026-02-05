using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

public class BranchDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public int? ManagerId { get; set; }
    public BranchStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateBranchDto
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public int? ManagerId { get; set; }
}

public class UpdateBranchDto
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public int? ManagerId { get; set; }
    public BranchStatus Status { get; set; }
}
