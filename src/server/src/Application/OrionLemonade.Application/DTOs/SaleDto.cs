using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.DTOs;

public class SaleDto
{
    public int Id { get; set; }
    public string SaleNumber { get; set; } = string.Empty;
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public DateTime SaleDate { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public SaleStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public PaymentMethod PaymentMethod { get; set; }
    public string PaymentMethodName { get; set; } = string.Empty;
    public PaymentStatus PaymentStatus { get; set; }
    public string PaymentStatusName { get; set; } = string.Empty;
    public decimal TotalTjs { get; set; }
    public decimal PaidTjs { get; set; }
    public decimal DebtTjs { get; set; }
    public DateTime? PaymentDueDate { get; set; }
    public string? Notes { get; set; }
    public int ItemCount { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserLogin { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SaleDetailDto
{
    public int Id { get; set; }
    public string SaleNumber { get; set; } = string.Empty;
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public DateTime SaleDate { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public SaleStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public PaymentMethod PaymentMethod { get; set; }
    public string PaymentMethodName { get; set; } = string.Empty;
    public PaymentStatus PaymentStatus { get; set; }
    public string PaymentStatusName { get; set; } = string.Empty;
    public decimal TotalTjs { get; set; }
    public decimal PaidTjs { get; set; }
    public decimal DebtTjs { get; set; }
    public DateTime? PaymentDueDate { get; set; }
    public string? Notes { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserLogin { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<SaleItemDto> Items { get; set; } = new();
    public List<PaymentDto> Payments { get; set; } = new();
}

public class SaleItemDto
{
    public int Id { get; set; }
    public int SaleId { get; set; }
    public int RecipeId { get; set; }
    public string RecipeName { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPriceTjs { get; set; }
    public decimal TotalTjs { get; set; }
    public decimal UnitCostUsd { get; set; }
    public decimal UnitCostTjs { get; set; }
    public decimal ExchangeRate { get; set; }
}

public class PaymentDto
{
    public int Id { get; set; }
    public int SaleId { get; set; }
    public DateTime PaymentDate { get; set; }
    public decimal AmountTjs { get; set; }
    public PaymentMethod Method { get; set; }
    public string MethodName { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserLogin { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSaleDto
{
    public int BranchId { get; set; }
    public DateTime SaleDate { get; set; }
    public int ClientId { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public DateTime? PaymentDueDate { get; set; }
    public string? Notes { get; set; }
    public List<CreateSaleItemDto> Items { get; set; } = new();
}

public class CreateSaleItemDto
{
    public int RecipeId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPriceTjs { get; set; }
}

public class UpdateSaleDto
{
    public DateTime SaleDate { get; set; }
    public int ClientId { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public DateTime? PaymentDueDate { get; set; }
    public string? Notes { get; set; }
}

public class CreatePaymentDto
{
    public DateTime PaymentDate { get; set; }
    public decimal AmountTjs { get; set; }
    public PaymentMethod Method { get; set; }
    public string? Notes { get; set; }
}

public class SaleSummaryDto
{
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public int TotalSales { get; set; }
    public decimal TotalRevenueTjs { get; set; }
    public decimal TotalPaidTjs { get; set; }
    public decimal TotalDebtTjs { get; set; }
    public int DraftCount { get; set; }
    public int ConfirmedCount { get; set; }
    public int ShippedCount { get; set; }
    public int PaidCount { get; set; }
}
