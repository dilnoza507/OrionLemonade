using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using System.Security.Claims;

namespace OrionLemonade.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class WarehouseController : ControllerBase
{
    private readonly IWarehouseService _warehouseService;

    public WarehouseController(IWarehouseService warehouseService)
    {
        _warehouseService = warehouseService;
    }

    private int? GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    #region Stock Endpoints

    [HttpGet("stock")]
    public async Task<ActionResult<IEnumerable<IngredientStockDto>>> GetAllStock(CancellationToken cancellationToken)
    {
        var stock = await _warehouseService.GetAllStockAsync(cancellationToken);
        return Ok(stock);
    }

    [HttpGet("stock/branch/{branchId}")]
    public async Task<ActionResult<IEnumerable<IngredientStockDto>>> GetStockByBranch(int branchId, CancellationToken cancellationToken)
    {
        var stock = await _warehouseService.GetStockByBranchAsync(branchId, cancellationToken);
        return Ok(stock);
    }

    [HttpGet("stock/low")]
    public async Task<ActionResult<IEnumerable<IngredientStockDto>>> GetLowStock([FromQuery] int? branchId, CancellationToken cancellationToken)
    {
        var stock = await _warehouseService.GetLowStockAsync(branchId, cancellationToken);
        return Ok(stock);
    }

    [HttpGet("stock/{branchId}/{ingredientId}")]
    public async Task<ActionResult<IngredientStockDto>> GetStock(int branchId, int ingredientId, CancellationToken cancellationToken)
    {
        var stock = await _warehouseService.GetStockAsync(branchId, ingredientId, cancellationToken);
        if (stock is null) return NotFound();
        return Ok(stock);
    }

    [HttpGet("stock/summary")]
    public async Task<ActionResult<IEnumerable<IngredientStockSummaryDto>>> GetStockSummary(CancellationToken cancellationToken)
    {
        var summary = await _warehouseService.GetStockSummaryAsync(cancellationToken);
        return Ok(summary);
    }

    #endregion

    #region Receipt Endpoints

    [HttpGet("receipts")]
    public async Task<ActionResult<IEnumerable<IngredientReceiptDto>>> GetReceipts(
        [FromQuery] int? branchId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        var receipts = await _warehouseService.GetReceiptsAsync(branchId, from, to, cancellationToken);
        return Ok(receipts);
    }

    [HttpGet("receipts/{id}")]
    public async Task<ActionResult<IngredientReceiptDto>> GetReceipt(int id, CancellationToken cancellationToken)
    {
        var receipt = await _warehouseService.GetReceiptByIdAsync(id, cancellationToken);
        if (receipt is null) return NotFound();
        return Ok(receipt);
    }

    [HttpPost("receipts")]
    public async Task<ActionResult<IngredientReceiptDto>> CreateReceipt(CreateIngredientReceiptDto dto, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (!userId.HasValue) return Unauthorized();

        var receipt = await _warehouseService.CreateReceiptAsync(dto, userId.Value, cancellationToken);
        return CreatedAtAction(nameof(GetReceipt), new { id = receipt.Id }, receipt);
    }

    [HttpDelete("receipts/{id}")]
    public async Task<IActionResult> DeleteReceipt(int id, CancellationToken cancellationToken)
    {
        var deleted = await _warehouseService.DeleteReceiptAsync(id, cancellationToken);
        if (!deleted) return NotFound();
        return NoContent();
    }

    #endregion

    #region Write-off Endpoints

    [HttpGet("writeoffs")]
    public async Task<ActionResult<IEnumerable<IngredientWriteOffDto>>> GetWriteOffs(
        [FromQuery] int? branchId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        var writeOffs = await _warehouseService.GetWriteOffsAsync(branchId, from, to, cancellationToken);
        return Ok(writeOffs);
    }

    [HttpGet("writeoffs/{id}")]
    public async Task<ActionResult<IngredientWriteOffDto>> GetWriteOff(int id, CancellationToken cancellationToken)
    {
        var writeOff = await _warehouseService.GetWriteOffByIdAsync(id, cancellationToken);
        if (writeOff is null) return NotFound();
        return Ok(writeOff);
    }

    [HttpPost("writeoffs")]
    public async Task<ActionResult<IngredientWriteOffDto>> CreateWriteOff(CreateIngredientWriteOffDto dto, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (!userId.HasValue) return Unauthorized();

        var writeOff = await _warehouseService.CreateWriteOffAsync(dto, userId.Value, cancellationToken);
        return CreatedAtAction(nameof(GetWriteOff), new { id = writeOff.Id }, writeOff);
    }

    [HttpDelete("writeoffs/{id}")]
    public async Task<IActionResult> DeleteWriteOff(int id, CancellationToken cancellationToken)
    {
        var deleted = await _warehouseService.DeleteWriteOffAsync(id, cancellationToken);
        if (!deleted) return NotFound();
        return NoContent();
    }

    #endregion

    #region Movement Endpoints

    [HttpGet("movements")]
    public async Task<ActionResult<IEnumerable<IngredientMovementDto>>> GetMovements(
        [FromQuery] int? branchId,
        [FromQuery] int? ingredientId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        var movements = await _warehouseService.GetMovementsAsync(branchId, ingredientId, from, to, cancellationToken);
        return Ok(movements);
    }

    [HttpPost("adjustments")]
    public async Task<ActionResult<IngredientMovementDto>> CreateAdjustment(CreateAdjustmentDto dto, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (!userId.HasValue) return Unauthorized();

        var movement = await _warehouseService.CreateAdjustmentAsync(dto, userId.Value, cancellationToken);
        return Ok(movement);
    }

    #endregion
}
