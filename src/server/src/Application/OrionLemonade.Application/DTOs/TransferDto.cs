using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

public class TransferDto
{
    public int Id { get; set; }
    public string TransferNumber { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public int SenderBranchId { get; set; }
    public string SenderBranchName { get; set; } = string.Empty;
    public int ReceiverBranchId { get; set; }
    public string ReceiverBranchName { get; set; } = string.Empty;
    public TransferType TransferType { get; set; }
    public string TransferTypeName { get; set; } = string.Empty;
    public TransferStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime? SentDate { get; set; }
    public DateTime? ReceivedDate { get; set; }
    public int? SentByUserId { get; set; }
    public string? SentByUserLogin { get; set; }
    public int? ReceivedByUserId { get; set; }
    public string? ReceivedByUserLogin { get; set; }
    public string? Comment { get; set; }
    public int ItemsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class TransferDetailDto : TransferDto
{
    public List<TransferItemDto> Items { get; set; } = new();
}

public class TransferItemDto
{
    public int Id { get; set; }
    public int TransferId { get; set; }
    public int ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public TransferItemType ItemType { get; set; }
    public string ItemTypeName { get; set; } = string.Empty;
    public decimal QuantitySent { get; set; }
    public decimal? QuantityReceived { get; set; }
    public decimal? Discrepancy { get; set; }
    public decimal TransferPriceUsd { get; set; }
    public string? Unit { get; set; }
}

public class CreateTransferDto
{
    public int SenderBranchId { get; set; }
    public int ReceiverBranchId { get; set; }
    public TransferType TransferType { get; set; }
    public string? Comment { get; set; }
    public List<CreateTransferItemDto> Items { get; set; } = new();
}

public class CreateTransferItemDto
{
    public int ItemId { get; set; }
    public decimal QuantitySent { get; set; }
    public decimal TransferPriceUsd { get; set; }
}

public class ReceiveTransferDto
{
    public List<ReceiveTransferItemDto> Items { get; set; } = new();
}

public class ReceiveTransferItemDto
{
    public int ItemId { get; set; }
    public decimal QuantityReceived { get; set; }
}
