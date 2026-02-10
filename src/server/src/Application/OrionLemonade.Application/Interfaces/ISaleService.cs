using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface ISaleService
{
    // Sales
    Task<IEnumerable<SaleDto>> GetSalesAsync(int? branchId = null, int? clientId = null, DateTime? from = null, DateTime? to = null);
    Task<SaleDto?> GetSaleByIdAsync(int id);
    Task<SaleDetailDto?> GetSaleDetailAsync(int id);
    Task<SaleDto> CreateSaleAsync(CreateSaleDto dto, int userId);
    Task<SaleDto?> UpdateSaleAsync(int id, UpdateSaleDto dto);
    Task<bool> DeleteSaleAsync(int id);

    // Sale operations
    Task<SaleDto?> ConfirmSaleAsync(int id, int userId);
    Task<SaleDto?> ShipSaleAsync(int id, int userId);
    Task<bool> CancelSaleAsync(int id);

    // Payments
    Task<PaymentDto> AddPaymentAsync(int saleId, CreatePaymentDto dto, int userId);
    Task<bool> DeletePaymentAsync(int paymentId);

    // Summary
    Task<IEnumerable<SaleSummaryDto>> GetSummaryAsync(DateTime? from = null, DateTime? to = null);
}
