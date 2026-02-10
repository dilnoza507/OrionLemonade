using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;

namespace OrionLemonade.API.Controllers;

[ApiController]
[Route("api/returns")]
[Authorize]
public class SaleReturnsController : ControllerBase
{
    private readonly ISaleReturnService _returnService;

    public SaleReturnsController(ISaleReturnService returnService)
    {
        _returnService = returnService;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SaleReturnDto>>> GetReturns(
        [FromQuery] int? branchId,
        [FromQuery] int? clientId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var returns = await _returnService.GetReturnsAsync(branchId, clientId, from, to);
        return Ok(returns);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SaleReturnDto>> GetReturn(int id)
    {
        var saleReturn = await _returnService.GetReturnByIdAsync(id);
        if (saleReturn == null)
            return NotFound();
        return Ok(saleReturn);
    }

    [HttpGet("{id}/detail")]
    public async Task<ActionResult<SaleReturnDetailDto>> GetReturnDetail(int id)
    {
        var saleReturn = await _returnService.GetReturnDetailAsync(id);
        if (saleReturn == null)
            return NotFound();
        return Ok(saleReturn);
    }

    [HttpPost]
    public async Task<ActionResult<SaleReturnDetailDto>> CreateReturn([FromBody] CreateSaleReturnDto dto)
    {
        try
        {
            var userId = GetUserId();
            var saleReturn = await _returnService.CreateReturnAsync(dto, userId);
            return CreatedAtAction(nameof(GetReturn), new { id = saleReturn.Id }, saleReturn);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SaleReturnDto>> UpdateReturn(int id, [FromBody] UpdateSaleReturnDto dto)
    {
        var saleReturn = await _returnService.UpdateReturnAsync(id, dto);
        if (saleReturn == null)
            return NotFound();
        return Ok(saleReturn);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReturn(int id)
    {
        var deleted = await _returnService.DeleteReturnAsync(id);
        if (!deleted)
            return NotFound();
        return NoContent();
    }
}
