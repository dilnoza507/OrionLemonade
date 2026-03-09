using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface IAuditLogService
{
    Task<(IEnumerable<AuditLogDto> Items, int TotalCount)> GetAllAsync(
        int? branchId = null,
        string? entityType = null,
        string? action = null,
        int? userId = null,
        DateTime? from = null,
        DateTime? to = null,
        int page = 1,
        int pageSize = 50,
        CancellationToken cancellationToken = default);

    Task<AuditLogDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<IEnumerable<string>> GetEntityTypesAsync(CancellationToken cancellationToken = default);
}
