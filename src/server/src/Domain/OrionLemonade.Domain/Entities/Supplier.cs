using OrionLemonade.Domain.Common;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Domain.Entities;

public class Supplier : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? Notes { get; set; }
    public SupplierStatus Status { get; set; } = SupplierStatus.Active;
}
