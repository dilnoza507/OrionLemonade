using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

public class SaleReturnDto
{
    public int Id { get; set; }
    public string ReturnNumber { get; set; } = string.Empty;
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public DateTime ReturnDate { get; set; }
    public int SaleId { get; set; }
    public string SaleNumber { get; set; } = string.Empty;
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public ReturnReason Reason { get; set; }
    public string ReasonName { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public int TotalQuantity { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserLogin { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SaleReturnDetailDto : SaleReturnDto
{
    public List<SaleReturnItemDto> Items { get; set; } = new();
}

public class SaleReturnItemDto
{
    public int Id { get; set; }
    public int ReturnId { get; set; }
    public int RecipeId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public bool ReturnToStock { get; set; }
}

public class CreateSaleReturnDto
{
    public int BranchId { get; set; }
    public DateTime ReturnDate { get; set; }
    public int SaleId { get; set; }
    public int ClientId { get; set; }
    public ReturnReason Reason { get; set; }
    public string? Comment { get; set; }
    public List<CreateSaleReturnItemDto> Items { get; set; } = new();
}

public class CreateSaleReturnItemDto
{
    public int RecipeId { get; set; }
    public int Quantity { get; set; }
    public bool ReturnToStock { get; set; }
}

public class UpdateSaleReturnDto
{
    public DateTime ReturnDate { get; set; }
    public ReturnReason Reason { get; set; }
    public string? Comment { get; set; }
}
