using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;

namespace OrionLemonade.API.Controllers;

[ApiController]
[Route("api/sales")]
[Authorize]
public class SalesController : ControllerBase
{
    private readonly ISaleService _saleService;

    public SalesController(ISaleService saleService)
    {
        _saleService = saleService;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }

    #region Sales

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SaleDto>>> GetSales(
        [FromQuery] int? branchId,
        [FromQuery] int? clientId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var sales = await _saleService.GetSalesAsync(branchId, clientId, from, to);
        return Ok(sales);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SaleDto>> GetSale(int id)
    {
        var sale = await _saleService.GetSaleByIdAsync(id);
        if (sale == null)
            return NotFound();
        return Ok(sale);
    }

    [HttpGet("{id}/detail")]
    public async Task<ActionResult<SaleDetailDto>> GetSaleDetail(int id)
    {
        var sale = await _saleService.GetSaleDetailAsync(id);
        if (sale == null)
            return NotFound();
        return Ok(sale);
    }

    [HttpPost]
    public async Task<ActionResult<SaleDto>> CreateSale([FromBody] CreateSaleDto dto)
    {
        var userId = GetUserId();
        var sale = await _saleService.CreateSaleAsync(dto, userId);
        return CreatedAtAction(nameof(GetSale), new { id = sale.Id }, sale);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SaleDto>> UpdateSale(int id, [FromBody] UpdateSaleDto dto)
    {
        var sale = await _saleService.UpdateSaleAsync(id, dto);
        if (sale == null)
            return NotFound();
        return Ok(sale);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSale(int id)
    {
        var deleted = await _saleService.DeleteSaleAsync(id);
        if (!deleted)
            return NotFound();
        return NoContent();
    }

    #endregion

    #region Sale Operations

    [HttpPost("{id}/confirm")]
    public async Task<ActionResult<SaleDto>> ConfirmSale(int id)
    {
        var userId = GetUserId();
        var sale = await _saleService.ConfirmSaleAsync(id, userId);
        if (sale == null)
            return NotFound();
        return Ok(sale);
    }

    [HttpPost("{id}/ship")]
    public async Task<ActionResult<SaleDto>> ShipSale(int id)
    {
        try
        {
            var userId = GetUserId();
            var sale = await _saleService.ShipSaleAsync(id, userId);
            if (sale == null)
                return NotFound();
            return Ok(sale);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelSale(int id)
    {
        var cancelled = await _saleService.CancelSaleAsync(id);
        if (!cancelled)
            return NotFound();
        return Ok(new { message = "Sale cancelled" });
    }

    #endregion

    #region Payments

    [HttpPost("{saleId}/payments")]
    public async Task<ActionResult<PaymentDto>> AddPayment(int saleId, [FromBody] CreatePaymentDto dto)
    {
        var userId = GetUserId();
        var payment = await _saleService.AddPaymentAsync(saleId, dto, userId);
        return Ok(payment);
    }

    [HttpDelete("payments/{paymentId}")]
    public async Task<IActionResult> DeletePayment(int paymentId)
    {
        var deleted = await _saleService.DeletePaymentAsync(paymentId);
        if (!deleted)
            return NotFound();
        return NoContent();
    }

    #endregion

    #region Summary

    [HttpGet("summary")]
    public async Task<ActionResult<IEnumerable<SaleSummaryDto>>> GetSummary(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var summary = await _saleService.GetSummaryAsync(from, to);
        return Ok(summary);
    }

    #endregion
}
