using OrionLemonade.Domain.Common;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class PayrollCalculation : BaseEntity
{
    public int EmployeeId { get; set; }
    public int BranchId { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public PayrollStatus Status { get; set; } = PayrollStatus.Draft;
    public decimal BaseSalary { get; set; }
    public decimal DailyPayTotal { get; set; }
    public decimal BonusTotal { get; set; }
    public decimal PenaltyTotal { get; set; }
    public decimal AdvanceTotal { get; set; }
    public decimal GrossTotal { get; set; }
    public decimal NetTotal { get; set; }
    public DateTime? CalculatedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public int? CalculatedByUserId { get; set; }
    public int? ApprovedByUserId { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public Employee Employee { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public User? CalculatedByUser { get; set; }
    public User? ApprovedByUser { get; set; }
    public ICollection<PayrollItem> Items { get; set; } = new List<PayrollItem>();
}
