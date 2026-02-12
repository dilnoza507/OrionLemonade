using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.API.Controllers;

[ApiController]
[Route("api/inventories")]
[Authorize]
public class InventoriesController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoriesController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryDto>>> GetInventories(
        [FromQuery] int? branchId,
        [FromQuery] InventoryType? type,
        [FromQuery] InventoryStatus? status)
    {
        var inventories = await _inventoryService.GetInventoriesAsync(branchId, type, status);
        return Ok(inventories);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InventoryDto>> GetInventory(int id)
    {
        var inventory = await _inventoryService.GetInventoryByIdAsync(id);
        if (inventory == null)
            return NotFound();
        return Ok(inventory);
    }

    [HttpGet("{id}/detail")]
    public async Task<ActionResult<InventoryDetailDto>> GetInventoryDetail(int id)
    {
        var inventory = await _inventoryService.GetInventoryDetailAsync(id);
        if (inventory == null)
            return NotFound();
        return Ok(inventory);
    }

    [HttpPost]
    public async Task<ActionResult<InventoryDetailDto>> CreateInventory([FromBody] CreateInventoryDto dto)
    {
        try
        {
            var userId = GetUserId();
            var inventory = await _inventoryService.CreateInventoryAsync(dto, userId);
            return CreatedAtAction(nameof(GetInventory), new { id = inventory.Id }, inventory);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/start")]
    public async Task<ActionResult<InventoryDto>> StartInventory(int id)
    {
        try
        {
            var userId = GetUserId();
            var inventory = await _inventoryService.StartInventoryAsync(id, userId);
            if (inventory == null)
                return NotFound();
            return Ok(inventory);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/complete")]
    public async Task<ActionResult<InventoryDto>> CompleteInventory(int id, [FromBody] CompleteInventoryDto dto)
    {
        try
        {
            var userId = GetUserId();
            var inventory = await _inventoryService.CompleteInventoryAsync(id, dto, userId);
            if (inventory == null)
                return NotFound();
            return Ok(inventory);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<InventoryDto>> CancelInventory(int id)
    {
        try
        {
            var inventory = await _inventoryService.CancelInventoryAsync(id);
            if (inventory == null)
                return NotFound();
            return Ok(inventory);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInventory(int id)
    {
        try
        {
            var deleted = await _inventoryService.DeleteInventoryAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
