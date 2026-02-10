using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using System.Security.Claims;

namespace OrionLemonade.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProductionController : ControllerBase
{
    private readonly IProductionService _productionService;

    public ProductionController(IProductionService productionService)
    {
        _productionService = productionService;
    }

    private int? GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    #region Batch Endpoints

    [HttpGet("batches")]
    public async Task<ActionResult<IEnumerable<ProductionBatchDto>>> GetBatches(
        [FromQuery] int? branchId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        var batches = await _productionService.GetBatchesAsync(branchId, from, to, cancellationToken);
        return Ok(batches);
    }

    [HttpGet("batches/{id}")]
    public async Task<ActionResult<ProductionBatchDto>> GetBatch(int id, CancellationToken cancellationToken)
    {
        var batch = await _productionService.GetBatchByIdAsync(id, cancellationToken);
        if (batch is null) return NotFound();
        return Ok(batch);
    }

    [HttpGet("batches/{id}/detail")]
    public async Task<ActionResult<ProductionBatchDetailDto>> GetBatchDetail(int id, CancellationToken cancellationToken)
    {
        var batch = await _productionService.GetBatchDetailByIdAsync(id, cancellationToken);
        if (batch is null) return NotFound();
        return Ok(batch);
    }

    [HttpPost("batches")]
    public async Task<ActionResult<ProductionBatchDto>> CreateBatch(CreateProductionBatchDto dto, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (!userId.HasValue) return Unauthorized();

        var batch = await _productionService.CreateBatchAsync(dto, userId.Value, cancellationToken);
        return CreatedAtAction(nameof(GetBatch), new { id = batch.Id }, batch);
    }

    [HttpPut("batches/{id}")]
    public async Task<ActionResult<ProductionBatchDto>> UpdateBatch(int id, UpdateProductionBatchDto dto, CancellationToken cancellationToken)
    {
        var batch = await _productionService.UpdateBatchAsync(id, dto, cancellationToken);
        if (batch is null) return NotFound();
        return Ok(batch);
    }

    [HttpDelete("batches/{id}")]
    public async Task<IActionResult> DeleteBatch(int id, CancellationToken cancellationToken)
    {
        var deleted = await _productionService.DeleteBatchAsync(id, cancellationToken);
        if (!deleted) return BadRequest("Cannot delete batch. Only planned batches can be deleted.");
        return NoContent();
    }

    #endregion

    #region Batch Operations

    [HttpPost("batches/{id}/start")]
    public async Task<ActionResult<ProductionBatchDetailDto>> StartBatch(int id, StartProductionDto dto, CancellationToken cancellationToken)
    {
        var batch = await _productionService.StartBatchAsync(id, dto, cancellationToken);
        if (batch is null) return BadRequest("Cannot start batch. Batch not found or not in Planned status.");
        return Ok(batch);
    }

    [HttpPost("batches/{id}/complete")]
    public async Task<ActionResult<ProductionBatchDetailDto>> CompleteBatch(int id, CompleteProductionDto dto, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (!userId.HasValue) return Unauthorized();

        var batch = await _productionService.CompleteBatchAsync(id, dto, userId.Value, cancellationToken);
        if (batch is null) return BadRequest("Cannot complete batch. Batch not found or not in InProgress status.");
        return Ok(batch);
    }

    [HttpPost("batches/{id}/cancel")]
    public async Task<IActionResult> CancelBatch(int id, CancellationToken cancellationToken)
    {
        var cancelled = await _productionService.CancelBatchAsync(id, cancellationToken);
        if (!cancelled) return BadRequest("Cannot cancel batch. Batch not found or already completed.");
        return Ok();
    }

    #endregion

    #region Summary & Helpers

    [HttpGet("summary")]
    public async Task<ActionResult<IEnumerable<ProductionSummaryDto>>> GetSummary(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        var summary = await _productionService.GetSummaryAsync(from, to, cancellationToken);
        return Ok(summary);
    }

    [HttpGet("calculate-consumption")]
    public async Task<ActionResult<List<BatchIngredientConsumptionInputDto>>> CalculateConsumption(
        [FromQuery] int recipeVersionId,
        [FromQuery] decimal plannedQuantity,
        CancellationToken cancellationToken)
    {
        var consumption = await _productionService.CalculatePlannedConsumptionAsync(recipeVersionId, plannedQuantity, cancellationToken);
        return Ok(consumption);
    }

    #endregion
}
