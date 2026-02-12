using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

public class InventoryDto
{
    public int Id { get; set; }
    public string InventoryNumber { get; set; } = string.Empty;
    public DateTime InventoryDate { get; set; }
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public InventoryType InventoryType { get; set; }
    public string InventoryTypeName { get; set; } = string.Empty;
    public InventoryStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? StartedByUserId { get; set; }
    public string? StartedByUserLogin { get; set; }
    public int? CompletedByUserId { get; set; }
    public string? CompletedByUserLogin { get; set; }
    public string? Comment { get; set; }
    public int ItemsCount { get; set; }
    public int ItemsWithDiscrepancy { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class InventoryDetailDto : InventoryDto
{
    public List<InventoryItemDto> Items { get; set; } = new();
}

public class InventoryItemDto
{
    public int Id { get; set; }
    public int InventoryId { get; set; }
    public int ItemId { get; set; }
    public InventoryItemType ItemType { get; set; }
    public string ItemTypeName { get; set; } = string.Empty;
    public string? ItemName { get; set; }
    public string? Unit { get; set; }
    public decimal ExpectedQuantity { get; set; }
    public decimal? ActualQuantity { get; set; }
    public decimal? Discrepancy { get; set; }
    public string? Notes { get; set; }
}

public class CreateInventoryDto
{
    public int BranchId { get; set; }
    public DateTime InventoryDate { get; set; }
    public InventoryType InventoryType { get; set; }
    public string? Comment { get; set; }
}

public class UpdateInventoryItemDto
{
    public int ItemId { get; set; }
    public decimal ActualQuantity { get; set; }
    public string? Notes { get; set; }
}

public class CompleteInventoryDto
{
    public List<UpdateInventoryItemDto> Items { get; set; } = new();
}
