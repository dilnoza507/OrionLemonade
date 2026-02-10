using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.API.Controllers;

[ApiController]
[Route("api/transfers")]
[Authorize]
public class TransfersController : ControllerBase
{
    private readonly ITransferService _transferService;

    public TransfersController(ITransferService transferService)
    {
        _transferService = transferService;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransferDto>>> GetTransfers(
        [FromQuery] int? branchId,
        [FromQuery] TransferType? type,
        [FromQuery] TransferStatus? status)
    {
        var transfers = await _transferService.GetTransfersAsync(branchId, type, status);
        return Ok(transfers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TransferDto>> GetTransfer(int id)
    {
        var transfer = await _transferService.GetTransferByIdAsync(id);
        if (transfer == null)
            return NotFound();
        return Ok(transfer);
    }

    [HttpGet("{id}/detail")]
    public async Task<ActionResult<TransferDetailDto>> GetTransferDetail(int id)
    {
        var transfer = await _transferService.GetTransferDetailAsync(id);
        if (transfer == null)
            return NotFound();
        return Ok(transfer);
    }

    [HttpPost]
    public async Task<ActionResult<TransferDetailDto>> CreateTransfer([FromBody] CreateTransferDto dto)
    {
        try
        {
            var userId = GetUserId();
            var transfer = await _transferService.CreateTransferAsync(dto, userId);
            return CreatedAtAction(nameof(GetTransfer), new { id = transfer.Id }, transfer);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/send")]
    public async Task<ActionResult<TransferDto>> SendTransfer(int id)
    {
        try
        {
            var userId = GetUserId();
            var transfer = await _transferService.SendTransferAsync(id, userId);
            if (transfer == null)
                return NotFound();
            return Ok(transfer);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/receive")]
    public async Task<ActionResult<TransferDto>> ReceiveTransfer(int id, [FromBody] ReceiveTransferDto dto)
    {
        try
        {
            var userId = GetUserId();
            var transfer = await _transferService.ReceiveTransferAsync(id, dto, userId);
            if (transfer == null)
                return NotFound();
            return Ok(transfer);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<TransferDto>> CancelTransfer(int id)
    {
        try
        {
            var transfer = await _transferService.CancelTransferAsync(id);
            if (transfer == null)
                return NotFound();
            return Ok(transfer);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTransfer(int id)
    {
        try
        {
            var deleted = await _transferService.DeleteTransferAsync(id);
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
