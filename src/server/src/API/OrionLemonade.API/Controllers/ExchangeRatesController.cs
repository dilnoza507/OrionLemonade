using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;

namespace OrionLemonade.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ExchangeRatesController : ControllerBase
{
    private readonly IExchangeRateService _exchangeRateService;

    public ExchangeRatesController(IExchangeRateService exchangeRateService)
    {
        _exchangeRateService = exchangeRateService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExchangeRateDto>>> GetAll(CancellationToken cancellationToken)
    {
        var rates = await _exchangeRateService.GetAllAsync(cancellationToken);
        return Ok(rates);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExchangeRateDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var rate = await _exchangeRateService.GetByIdAsync(id, cancellationToken);
        if (rate is null) return NotFound();
        return Ok(rate);
    }

    [HttpGet("latest")]
    public async Task<ActionResult<ExchangeRateDto>> GetLatest(CancellationToken cancellationToken)
    {
        var rate = await _exchangeRateService.GetLatestAsync(cancellationToken);
        if (rate is null) return NotFound();
        return Ok(rate);
    }

    [HttpGet("date/{date}")]
    public async Task<ActionResult<ExchangeRateDto>> GetByDate(DateOnly date, CancellationToken cancellationToken)
    {
        var rate = await _exchangeRateService.GetByDateAsync(date, cancellationToken);
        if (rate is null) return NotFound();
        return Ok(rate);
    }

    [HttpPost]
    public async Task<ActionResult<ExchangeRateDto>> Create(CreateExchangeRateDto dto, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var rate = await _exchangeRateService.CreateAsync(dto, userId, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = rate.Id }, rate);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ExchangeRateDto>> Update(int id, UpdateExchangeRateDto dto, CancellationToken cancellationToken)
    {
        var rate = await _exchangeRateService.UpdateAsync(id, dto, cancellationToken);
        if (rate is null) return NotFound();
        return Ok(rate);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _exchangeRateService.DeleteAsync(id, cancellationToken);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
