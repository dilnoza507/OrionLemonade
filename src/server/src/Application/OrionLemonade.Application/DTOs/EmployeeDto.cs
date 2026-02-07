using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

public class EmployeeDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Position { get; set; }
    public string? Phone { get; set; }
    public DateOnly? HireDate { get; set; }
    public decimal? HourlyRate { get; set; }
    public decimal? MonthlyRate { get; set; }
    public int? BranchId { get; set; }
    public string? BranchName { get; set; }
    public EmployeeStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateEmployeeDto
{
    public string FullName { get; set; } = string.Empty;
    public string? Position { get; set; }
    public string? Phone { get; set; }
    public DateOnly? HireDate { get; set; }
    public decimal? HourlyRate { get; set; }
    public decimal? MonthlyRate { get; set; }
    public int? BranchId { get; set; }
}

public class UpdateEmployeeDto
{
    public string FullName { get; set; } = string.Empty;
    public string? Position { get; set; }
    public string? Phone { get; set; }
    public DateOnly? HireDate { get; set; }
    public decimal? HourlyRate { get; set; }
    public decimal? MonthlyRate { get; set; }
    public int? BranchId { get; set; }
    public EmployeeStatus Status { get; set; }
}
