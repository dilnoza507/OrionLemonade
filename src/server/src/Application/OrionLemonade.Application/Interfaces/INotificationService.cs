using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface INotificationService
{
    Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(int? userId = null, bool includeRead = false, CancellationToken cancellationToken = default);
    Task<int> GetUnreadCountAsync(int? userId = null, CancellationToken cancellationToken = default);
    Task<NotificationDto> CreateAsync(CreateNotificationDto dto, CancellationToken cancellationToken = default);
    Task<bool> MarkAsReadAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> MarkAllAsReadAsync(int? userId = null, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task GenerateLowStockNotificationsAsync(CancellationToken cancellationToken = default);
    Task GenerateExpiringNotificationsAsync(CancellationToken cancellationToken = default);
}
