using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Services;

public class AuditLogService : IAuditLogService
{
    private readonly DbContext _context;

    public AuditLogService(DbContext context)
    {
        _context = context;
    }

    public async Task<(IEnumerable<AuditLogDto> Items, int TotalCount)> GetAllAsync(
        int? branchId = null,
        string? entityType = null,
        string? action = null,
        int? userId = null,
        DateTime? from = null,
        DateTime? to = null,
        int page = 1,
        int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Set<Domain.Entities.AuditLog>()
            .Include(a => a.User)
            .Include(a => a.Branch)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(a => a.BranchId == branchId.Value);

        if (!string.IsNullOrEmpty(entityType))
            query = query.Where(a => a.EntityType == entityType);

        if (!string.IsNullOrEmpty(action) && Enum.TryParse<AuditAction>(action, true, out var actionEnum))
            query = query.Where(a => a.Action == actionEnum);

        if (userId.HasValue)
            query = query.Where(a => a.UserId == userId.Value);

        if (from.HasValue)
            query = query.Where(a => a.ActionTime >= from.Value);

        if (to.HasValue)
            query = query.Where(a => a.ActionTime <= to.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(a => a.ActionTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                UserId = a.UserId,
                UserLogin = a.User.Login,
                ActionTime = a.ActionTime,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                Action = a.Action.ToString(),
                BranchId = a.BranchId,
                BranchName = a.Branch != null ? a.Branch.Name : null,
                OldValue = a.OldValue,
                NewValue = a.NewValue
            })
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<AuditLogDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Domain.Entities.AuditLog>()
            .Include(a => a.User)
            .Include(a => a.Branch)
            .Where(a => a.Id == id)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                UserId = a.UserId,
                UserLogin = a.User.Login,
                ActionTime = a.ActionTime,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                Action = a.Action.ToString(),
                BranchId = a.BranchId,
                BranchName = a.Branch != null ? a.Branch.Name : null,
                OldValue = a.OldValue,
                NewValue = a.NewValue
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<string>> GetEntityTypesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Set<Domain.Entities.AuditLog>()
            .Select(a => a.EntityType)
            .Distinct()
            .OrderBy(t => t)
            .ToListAsync(cancellationToken);
    }
}
