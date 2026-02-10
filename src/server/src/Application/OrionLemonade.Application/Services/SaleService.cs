using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Services;

public class SaleService : ISaleService
{
    private readonly DbContext _context;
    private readonly IProductStockService _productStockService;

    public SaleService(DbContext context, IProductStockService productStockService)
    {
        _context = context;
        _productStockService = productStockService;
    }

    #region Sales

    public async Task<IEnumerable<SaleDto>> GetSalesAsync(int? branchId = null, int? clientId = null, DateTime? from = null, DateTime? to = null)
    {
        var query = _context.Set<Sale>()
            .Include(s => s.Branch)
            .Include(s => s.Client)
            .Include(s => s.CreatedByUser)
            .Include(s => s.Items)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(s => s.BranchId == branchId.Value);

        if (clientId.HasValue)
            query = query.Where(s => s.ClientId == clientId.Value);

        if (from.HasValue)
            query = query.Where(s => s.SaleDate >= from.Value);

        if (to.HasValue)
            query = query.Where(s => s.SaleDate <= to.Value);

        var sales = await query
            .OrderByDescending(s => s.SaleDate)
            .ThenByDescending(s => s.CreatedAt)
            .ToListAsync();

        return sales.Select(MapToDto);
    }

    public async Task<SaleDto?> GetSaleByIdAsync(int id)
    {
        var sale = await _context.Set<Sale>()
            .Include(s => s.Branch)
            .Include(s => s.Client)
            .Include(s => s.CreatedByUser)
            .Include(s => s.Items)
            .FirstOrDefaultAsync(s => s.Id == id);

        return sale is null ? null : MapToDto(sale);
    }

    public async Task<SaleDetailDto?> GetSaleDetailAsync(int id)
    {
        var sale = await _context.Set<Sale>()
            .Include(s => s.Branch)
            .Include(s => s.Client)
            .Include(s => s.CreatedByUser)
            .Include(s => s.Items)
                .ThenInclude(i => i.Recipe)
            .Include(s => s.Payments)
                .ThenInclude(p => p.CreatedByUser)
            .FirstOrDefaultAsync(s => s.Id == id);

        return sale is null ? null : MapToDetailDto(sale);
    }

    public async Task<SaleDto> CreateSaleAsync(CreateSaleDto dto, int userId)
    {
        // Generate sale number
        var today = DateTime.UtcNow.Date;
        var branch = await _context.Set<Branch>().FindAsync(dto.BranchId);
        var branchCode = branch?.Code ?? "XX";
        var saleCount = await _context.Set<Sale>()
            .CountAsync(s => s.CreatedAt.Date == today && s.BranchId == dto.BranchId);

        var saleNumber = $"ПР-{branchCode}-{today:yyyyMMdd}-{(saleCount + 1):D3}";

        // Get current exchange rate
        var exchangeRate = await GetCurrentExchangeRateAsync();

        var sale = new Sale
        {
            SaleNumber = saleNumber,
            BranchId = dto.BranchId,
            SaleDate = dto.SaleDate,
            ClientId = dto.ClientId,
            Status = SaleStatus.Draft,
            PaymentMethod = dto.PaymentMethod,
            PaymentStatus = PaymentStatus.Unpaid,
            TotalTjs = 0,
            PaidTjs = 0,
            DebtTjs = 0,
            PaymentDueDate = dto.PaymentDueDate,
            Notes = dto.Notes,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Set<Sale>().Add(sale);
        await _context.SaveChangesAsync();

        // Add items
        decimal total = 0;
        foreach (var itemDto in dto.Items)
        {
            var itemTotal = itemDto.Quantity * itemDto.UnitPriceTjs;
            var item = new SaleItem
            {
                SaleId = sale.Id,
                RecipeId = itemDto.RecipeId,
                Quantity = itemDto.Quantity,
                UnitPriceTjs = itemDto.UnitPriceTjs,
                TotalTjs = itemTotal,
                UnitCostUsd = 0, // Will be set when shipped
                UnitCostTjs = 0,
                ExchangeRate = exchangeRate,
                CreatedAt = DateTime.UtcNow
            };
            _context.Set<SaleItem>().Add(item);
            total += itemTotal;
        }

        sale.TotalTjs = total;
        sale.DebtTjs = total;
        await _context.SaveChangesAsync();

        return (await GetSaleByIdAsync(sale.Id))!;
    }

    public async Task<SaleDto?> UpdateSaleAsync(int id, UpdateSaleDto dto)
    {
        var sale = await _context.Set<Sale>()
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sale is null) return null;
        if (sale.Status != SaleStatus.Draft) return null;

        sale.SaleDate = dto.SaleDate;
        sale.ClientId = dto.ClientId;
        sale.PaymentMethod = dto.PaymentMethod;
        sale.PaymentDueDate = dto.PaymentDueDate;
        sale.Notes = dto.Notes;
        sale.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetSaleByIdAsync(id);
    }

    public async Task<bool> DeleteSaleAsync(int id)
    {
        var sale = await _context.Set<Sale>()
            .Include(s => s.Items)
            .Include(s => s.Payments)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sale is null) return false;
        if (sale.Status != SaleStatus.Draft) return false;

        _context.Set<Payment>().RemoveRange(sale.Payments);
        _context.Set<SaleItem>().RemoveRange(sale.Items);
        _context.Set<Sale>().Remove(sale);
        await _context.SaveChangesAsync();

        return true;
    }

    #endregion

    #region Sale Operations

    public async Task<SaleDto?> ConfirmSaleAsync(int id, int userId)
    {
        var sale = await _context.Set<Sale>()
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sale is null) return null;
        if (sale.Status != SaleStatus.Draft) return null;

        sale.Status = SaleStatus.Confirmed;
        sale.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetSaleByIdAsync(id);
    }

    public async Task<SaleDto?> ShipSaleAsync(int id, int userId)
    {
        var sale = await _context.Set<Sale>()
            .Include(s => s.Items)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sale is null) return null;
        if (sale.Status != SaleStatus.Confirmed) return null;

        // Deduct from product stock
        foreach (var item in sale.Items)
        {
            await _productStockService.RecordSaleAsync(new SellProductDto
            {
                BranchId = sale.BranchId,
                RecipeId = item.RecipeId,
                Quantity = item.Quantity,
                DocumentType = "Sale",
                DocumentId = sale.Id,
                Notes = $"Sale {sale.SaleNumber}"
            }, userId);
        }

        sale.Status = SaleStatus.Shipped;
        sale.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetSaleByIdAsync(id);
    }

    public async Task<bool> CancelSaleAsync(int id)
    {
        var sale = await _context.Set<Sale>()
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sale is null) return false;
        if (sale.Status == SaleStatus.Shipped || sale.Status == SaleStatus.Paid) return false;

        sale.Status = SaleStatus.Cancelled;
        sale.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }

    #endregion

    #region Payments

    public async Task<PaymentDto> AddPaymentAsync(int saleId, CreatePaymentDto dto, int userId)
    {
        var sale = await _context.Set<Sale>()
            .FirstOrDefaultAsync(s => s.Id == saleId);

        if (sale is null)
            throw new InvalidOperationException("Sale not found");

        var payment = new Payment
        {
            SaleId = saleId,
            PaymentDate = dto.PaymentDate,
            AmountTjs = dto.AmountTjs,
            Method = dto.Method,
            Notes = dto.Notes,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<Payment>().Add(payment);

        // Update sale payment status
        sale.PaidTjs += dto.AmountTjs;
        sale.DebtTjs = sale.TotalTjs - sale.PaidTjs;

        if (sale.DebtTjs <= 0)
        {
            sale.PaymentStatus = PaymentStatus.Paid;
            sale.Status = SaleStatus.Paid;
        }
        else if (sale.PaidTjs > 0)
        {
            sale.PaymentStatus = PaymentStatus.Partial;
            if (sale.Status == SaleStatus.Shipped)
                sale.Status = SaleStatus.PartiallyPaid;
        }

        sale.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapPaymentToDto(payment);
    }

    public async Task<bool> DeletePaymentAsync(int paymentId)
    {
        var payment = await _context.Set<Payment>()
            .Include(p => p.Sale)
            .FirstOrDefaultAsync(p => p.Id == paymentId);

        if (payment is null) return false;

        var sale = payment.Sale;
        sale.PaidTjs -= payment.AmountTjs;
        sale.DebtTjs = sale.TotalTjs - sale.PaidTjs;

        if (sale.PaidTjs <= 0)
        {
            sale.PaymentStatus = PaymentStatus.Unpaid;
        }
        else
        {
            sale.PaymentStatus = PaymentStatus.Partial;
        }

        // Revert status if needed
        if (sale.Status == SaleStatus.Paid)
        {
            sale.Status = sale.PaidTjs > 0 ? SaleStatus.PartiallyPaid : SaleStatus.Shipped;
        }

        sale.UpdatedAt = DateTime.UtcNow;

        _context.Set<Payment>().Remove(payment);
        await _context.SaveChangesAsync();

        return true;
    }

    #endregion

    #region Summary

    public async Task<IEnumerable<SaleSummaryDto>> GetSummaryAsync(DateTime? from = null, DateTime? to = null)
    {
        var branches = await _context.Set<Branch>()
            .Where(b => b.Status == BranchStatus.Active)
            .ToListAsync();

        var query = _context.Set<Sale>().AsQueryable();

        if (from.HasValue)
            query = query.Where(s => s.SaleDate >= from.Value);

        if (to.HasValue)
            query = query.Where(s => s.SaleDate <= to.Value);

        var sales = await query.ToListAsync();

        return branches.Select(branch => new SaleSummaryDto
        {
            BranchId = branch.Id,
            BranchName = branch.Name,
            TotalSales = sales.Count(s => s.BranchId == branch.Id && s.Status != SaleStatus.Cancelled),
            TotalRevenueTjs = sales.Where(s => s.BranchId == branch.Id && s.Status != SaleStatus.Cancelled).Sum(s => s.TotalTjs),
            TotalPaidTjs = sales.Where(s => s.BranchId == branch.Id && s.Status != SaleStatus.Cancelled).Sum(s => s.PaidTjs),
            TotalDebtTjs = sales.Where(s => s.BranchId == branch.Id && s.Status != SaleStatus.Cancelled).Sum(s => s.DebtTjs),
            DraftCount = sales.Count(s => s.BranchId == branch.Id && s.Status == SaleStatus.Draft),
            ConfirmedCount = sales.Count(s => s.BranchId == branch.Id && s.Status == SaleStatus.Confirmed),
            ShippedCount = sales.Count(s => s.BranchId == branch.Id && (s.Status == SaleStatus.Shipped || s.Status == SaleStatus.PartiallyPaid)),
            PaidCount = sales.Count(s => s.BranchId == branch.Id && s.Status == SaleStatus.Paid)
        });
    }

    #endregion

    #region Private Methods

    private async Task<decimal> GetCurrentExchangeRateAsync()
    {
        var rate = await _context.Set<ExchangeRate>()
            .OrderByDescending(r => r.RateDate)
            .FirstOrDefaultAsync();

        return rate?.Rate ?? 10.9m;
    }

    private static SaleDto MapToDto(Sale entity)
    {
        return new SaleDto
        {
            Id = entity.Id,
            SaleNumber = entity.SaleNumber,
            BranchId = entity.BranchId,
            BranchName = entity.Branch?.Name ?? string.Empty,
            SaleDate = entity.SaleDate,
            ClientId = entity.ClientId,
            ClientName = entity.Client?.Name ?? string.Empty,
            Status = entity.Status,
            StatusName = GetStatusName(entity.Status),
            PaymentMethod = entity.PaymentMethod,
            PaymentMethodName = GetPaymentMethodName(entity.PaymentMethod),
            PaymentStatus = entity.PaymentStatus,
            PaymentStatusName = GetPaymentStatusName(entity.PaymentStatus),
            TotalTjs = entity.TotalTjs,
            PaidTjs = entity.PaidTjs,
            DebtTjs = entity.DebtTjs,
            PaymentDueDate = entity.PaymentDueDate,
            Notes = entity.Notes,
            ItemCount = entity.Items?.Count ?? 0,
            CreatedByUserId = entity.CreatedByUserId,
            CreatedByUserLogin = entity.CreatedByUser?.Login,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    private static SaleDetailDto MapToDetailDto(Sale entity)
    {
        return new SaleDetailDto
        {
            Id = entity.Id,
            SaleNumber = entity.SaleNumber,
            BranchId = entity.BranchId,
            BranchName = entity.Branch?.Name ?? string.Empty,
            SaleDate = entity.SaleDate,
            ClientId = entity.ClientId,
            ClientName = entity.Client?.Name ?? string.Empty,
            Status = entity.Status,
            StatusName = GetStatusName(entity.Status),
            PaymentMethod = entity.PaymentMethod,
            PaymentMethodName = GetPaymentMethodName(entity.PaymentMethod),
            PaymentStatus = entity.PaymentStatus,
            PaymentStatusName = GetPaymentStatusName(entity.PaymentStatus),
            TotalTjs = entity.TotalTjs,
            PaidTjs = entity.PaidTjs,
            DebtTjs = entity.DebtTjs,
            PaymentDueDate = entity.PaymentDueDate,
            Notes = entity.Notes,
            CreatedByUserId = entity.CreatedByUserId,
            CreatedByUserLogin = entity.CreatedByUser?.Login,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            Items = entity.Items?.Select(MapItemToDto).ToList() ?? new List<SaleItemDto>(),
            Payments = entity.Payments?.Select(MapPaymentToDto).ToList() ?? new List<PaymentDto>()
        };
    }

    private static SaleItemDto MapItemToDto(SaleItem entity)
    {
        return new SaleItemDto
        {
            Id = entity.Id,
            SaleId = entity.SaleId,
            RecipeId = entity.RecipeId,
            RecipeName = entity.Recipe?.Name ?? string.Empty,
            ProductName = entity.Recipe?.ProductName ?? string.Empty,
            Quantity = entity.Quantity,
            UnitPriceTjs = entity.UnitPriceTjs,
            TotalTjs = entity.TotalTjs,
            UnitCostUsd = entity.UnitCostUsd,
            UnitCostTjs = entity.UnitCostTjs,
            ExchangeRate = entity.ExchangeRate
        };
    }

    private static PaymentDto MapPaymentToDto(Payment entity)
    {
        return new PaymentDto
        {
            Id = entity.Id,
            SaleId = entity.SaleId,
            PaymentDate = entity.PaymentDate,
            AmountTjs = entity.AmountTjs,
            Method = entity.Method,
            MethodName = GetPaymentMethodName(entity.Method),
            Notes = entity.Notes,
            CreatedByUserId = entity.CreatedByUserId,
            CreatedByUserLogin = entity.CreatedByUser?.Login,
            CreatedAt = entity.CreatedAt
        };
    }

    private static string GetStatusName(SaleStatus status)
    {
        return status switch
        {
            SaleStatus.Draft => "Черновик",
            SaleStatus.Confirmed => "Подтверждено",
            SaleStatus.Shipped => "Отгружено",
            SaleStatus.Paid => "Оплачено",
            SaleStatus.PartiallyPaid => "Частично оплачено",
            SaleStatus.Cancelled => "Отменено",
            _ => status.ToString()
        };
    }

    private static string GetPaymentMethodName(PaymentMethod method)
    {
        return method switch
        {
            PaymentMethod.Cash => "Наличные",
            PaymentMethod.BankTransfer => "Банковский перевод",
            _ => method.ToString()
        };
    }

    private static string GetPaymentStatusName(PaymentStatus status)
    {
        return status switch
        {
            PaymentStatus.Unpaid => "Не оплачено",
            PaymentStatus.Partial => "Частично",
            PaymentStatus.Paid => "Оплачено",
            _ => status.ToString()
        };
    }

    #endregion
}
