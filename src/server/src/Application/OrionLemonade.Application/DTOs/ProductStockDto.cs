using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

public class ProductStockDto
{
    public int Id { get; set; }
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public int RecipeId { get; set; }
    public string RecipeName { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int? ProductionBatchId { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime ProductionDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public int Quantity { get; set; }
    public decimal UnitCostUsd { get; set; }
    public decimal UnitCostTjs { get; set; }
    public decimal ExchangeRate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ProductStockSummaryDto
{
    public int RecipeId { get; set; }
    public string RecipeName { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int TotalQuantity { get; set; }
    public decimal TotalValueUsd { get; set; }
    public decimal TotalValueTjs { get; set; }
}

public class BranchProductStockDto
{
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public List<ProductStockSummaryDto> Products { get; set; } = new();
    public int TotalQuantity { get; set; }
    public decimal TotalValueUsd { get; set; }
    public decimal TotalValueTjs { get; set; }
}

public class CreateProductStockDto
{
    public int BranchId { get; set; }
    public int RecipeId { get; set; }
    public int? ProductionBatchId { get; set; }
    public DateTime ProductionDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public int Quantity { get; set; }
    public decimal UnitCostUsd { get; set; }
    public decimal UnitCostTjs { get; set; }
    public decimal ExchangeRate { get; set; }
}

public class AdjustProductStockDto
{
    public int Quantity { get; set; }
    public string? Notes { get; set; }
}

public class ProductMovementDto
{
    public int Id { get; set; }
    public DateTime MovementDate { get; set; }
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public int RecipeId { get; set; }
    public string RecipeName { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int? ProductionBatchId { get; set; }
    public string? BatchNumber { get; set; }
    public ProductMovementType OperationType { get; set; }
    public string OperationTypeName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int BalanceAfter { get; set; }
    public string? DocumentType { get; set; }
    public int? DocumentId { get; set; }
    public int? UserId { get; set; }
    public string? UserName { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateProductMovementDto
{
    public int BranchId { get; set; }
    public int RecipeId { get; set; }
    public int? ProductionBatchId { get; set; }
    public ProductMovementType OperationType { get; set; }
    public int Quantity { get; set; }
    public string? DocumentType { get; set; }
    public int? DocumentId { get; set; }
    public string? Notes { get; set; }
}

public class TransferProductDto
{
    public int FromBranchId { get; set; }
    public int ToBranchId { get; set; }
    public int RecipeId { get; set; }
    public int Quantity { get; set; }
    public string? Notes { get; set; }
}

public class SellProductDto
{
    public int BranchId { get; set; }
    public int RecipeId { get; set; }
    public int Quantity { get; set; }
    public string? DocumentType { get; set; }
    public int? DocumentId { get; set; }
    public string? Notes { get; set; }
}

public class WriteOffProductDto
{
    public int BranchId { get; set; }
    public int RecipeId { get; set; }
    public int Quantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
}
