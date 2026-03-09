using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.API.Authorization;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;

namespace OrionLemonade.API.Controllers;

[Authorize(Roles = Roles.AuditLogView)]
[ApiController]
[Route("api/[controller]")]
public class AuditLogController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetAll(
        [FromQuery] int? branchId,
        [FromQuery] string? entityType,
        [FromQuery] string? action,
        [FromQuery] int? userId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await _auditLogService.GetAllAsync(
            branchId, entityType, action, userId, from, to, page, pageSize, cancellationToken);

        return Ok(new
        {
            items,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AuditLogDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var log = await _auditLogService.GetByIdAsync(id, cancellationToken);
        if (log is null) return NotFound();
        return Ok(log);
    }

    [HttpGet("entity-types")]
    public async Task<ActionResult<IEnumerable<string>>> GetEntityTypes(CancellationToken cancellationToken)
    {
        var types = await _auditLogService.GetEntityTypesAsync(cancellationToken);
        return Ok(types);
    }
}
