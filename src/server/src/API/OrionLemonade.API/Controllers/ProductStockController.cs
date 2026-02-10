using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using System.Security.Claims;

namespace OrionLemonade.API.Controllers;

[ApiController]
[Route("api/product-stock")]
[Authorize]
public class ProductStockController : ControllerBase
{
    private readonly IProductStockService _productStockService;

    public ProductStockController(IProductStockService productStockService)
    {
        _productStockService = productStockService;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }

    // Stock endpoints
    [HttpGet("stocks")]
    public async Task<ActionResult<IEnumerable<ProductStockDto>>> GetStocks([FromQuery] int? branchId, [FromQuery] int? recipeId)
    {
        var stocks = await _productStockService.GetStocksAsync(branchId, recipeId);
        return Ok(stocks);
    }

    [HttpGet("stocks/{id}")]
    public async Task<ActionResult<ProductStockDto>> GetStock(int id)
    {
        var stock = await _productStockService.GetStockByIdAsync(id);
        if (stock == null)
            return NotFound();
        return Ok(stock);
    }

    [HttpGet("summary")]
    public async Task<ActionResult<IEnumerable<BranchProductStockDto>>> GetStockSummary()
    {
        var summary = await _productStockService.GetStockSummaryByBranchAsync();
        return Ok(summary);
    }

    [HttpGet("quantity")]
    public async Task<ActionResult<int>> GetQuantity([FromQuery] int branchId, [FromQuery] int recipeId)
    {
        var quantity = await _productStockService.GetTotalQuantityAsync(branchId, recipeId);
        return Ok(quantity);
    }

    [HttpPost("stocks")]
    public async Task<ActionResult<ProductStockDto>> AddStock([FromBody] CreateProductStockDto dto)
    {
        var stock = await _productStockService.AddStockAsync(dto, GetUserId());
        return CreatedAtAction(nameof(GetStock), new { id = stock.Id }, stock);
    }

    [HttpPut("stocks/{branchId}/{recipeId}/adjust")]
    public async Task<ActionResult<ProductStockDto>> AdjustStock(int branchId, int recipeId, [FromBody] AdjustProductStockDto dto)
    {
        try
        {
            var stock = await _productStockService.AdjustStockAsync(branchId, recipeId, dto, GetUserId());
            return Ok(stock);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // Movement endpoints
    [HttpGet("movements")]
    public async Task<ActionResult<IEnumerable<ProductMovementDto>>> GetMovements(
        [FromQuery] int? branchId,
        [FromQuery] int? recipeId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var movements = await _productStockService.GetMovementsAsync(branchId, recipeId, from, to);
        return Ok(movements);
    }

    [HttpGet("movements/{id}")]
    public async Task<ActionResult<ProductMovementDto>> GetMovement(int id)
    {
        var movement = await _productStockService.GetMovementByIdAsync(id);
        if (movement == null)
            return NotFound();
        return Ok(movement);
    }

    // Operations
    [HttpPost("sell")]
    public async Task<ActionResult<ProductMovementDto>> Sell([FromBody] SellProductDto dto)
    {
        try
        {
            var movement = await _productStockService.RecordSaleAsync(dto, GetUserId());
            return Ok(movement);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("write-off")]
    public async Task<ActionResult<ProductMovementDto>> WriteOff([FromBody] WriteOffProductDto dto)
    {
        try
        {
            var movement = await _productStockService.RecordWriteOffAsync(dto, GetUserId());
            return Ok(movement);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("transfer")]
    public async Task<ActionResult> Transfer([FromBody] TransferProductDto dto)
    {
        try
        {
            await _productStockService.TransferAsync(dto, GetUserId());
            return Ok(new { message = "Transfer completed successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
