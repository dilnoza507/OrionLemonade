using Microsoft.EntityFrameworkCore;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Domain.Entities;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Services;

public class NotificationService : INotificationService
{
    private readonly DbContext _dbContext;

    public NotificationService(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(int? userId = null, bool includeRead = false, CancellationToken cancellationToken = default)
    {
        // First, generate dynamic notifications
        await GenerateLowStockNotificationsAsync(cancellationToken);

        var query = _dbContext.Set<Notification>()
            .Include(n => n.Branch)
            .AsQueryable();

        if (userId.HasValue)
        {
            query = query.Where(n => n.UserId == userId || n.UserId == null);
        }

        if (!includeRead)
        {
            query = query.Where(n => !n.IsRead);
        }

        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync(cancellationToken);

        return notifications.Select(MapToDto);
    }

    public async Task<int> GetUnreadCountAsync(int? userId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<Notification>()
            .Where(n => !n.IsRead);

        if (userId.HasValue)
        {
            query = query.Where(n => n.UserId == userId || n.UserId == null);
        }

        return await query.CountAsync(cancellationToken);
    }

    public async Task<NotificationDto> CreateAsync(CreateNotificationDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new Notification
        {
            Type = dto.Type,
            Title = dto.Title,
            Message = dto.Message,
            UserId = dto.UserId,
            BranchId = dto.BranchId,
            RelatedEntityType = dto.RelatedEntityType,
            RelatedEntityId = dto.RelatedEntityId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<Notification>().Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<bool> MarkAsReadAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<Notification>().FindAsync([id], cancellationToken);
        if (entity is null) return false;

        entity.IsRead = true;
        entity.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<bool> MarkAllAsReadAsync(int? userId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<Notification>()
            .Where(n => !n.IsRead);

        if (userId.HasValue)
        {
            query = query.Where(n => n.UserId == userId || n.UserId == null);
        }

        var notifications = await query.ToListAsync(cancellationToken);
        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.UpdatedAt = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<Notification>().FindAsync([id], cancellationToken);
        if (entity is null) return false;

        _dbContext.Set<Notification>().Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task GenerateLowStockNotificationsAsync(CancellationToken cancellationToken = default)
    {
        // Get ingredients with min stock defined
        var ingredients = await _dbContext.Set<Ingredient>()
            .Where(i => i.MinStock != null && i.MinStock > 0 && i.Status == IngredientStatus.Active)
            .ToListAsync(cancellationToken);

        // Get all stocks
        var stocks = await _dbContext.Set<IngredientStock>()
            .Include(s => s.Branch)
            .Include(s => s.Ingredient)
            .ToListAsync(cancellationToken);

        foreach (var ingredient in ingredients)
        {
            var ingredientStocks = stocks.Where(s => s.IngredientId == ingredient.Id).ToList();

            foreach (var stock in ingredientStocks)
            {
                if (stock.Quantity < ingredient.MinStock)
                {
                    // Check if notification already exists for this ingredient/branch today
                    var existingNotification = await _dbContext.Set<Notification>()
                        .Where(n => n.Type == NotificationType.LowStock
                            && n.RelatedEntityType == "Ingredient"
                            && n.RelatedEntityId == ingredient.Id
                            && n.BranchId == stock.BranchId
                            && n.CreatedAt.Date == DateTime.UtcNow.Date)
                        .FirstOrDefaultAsync(cancellationToken);

                    if (existingNotification == null)
                    {
                        var unitName = ingredient.BaseUnit switch
                        {
                            BaseUnit.Kg => "кг",
                            BaseUnit.L => "л",
                            BaseUnit.Pcs => "шт",
                            _ => ""
                        };

                        var notification = new Notification
                        {
                            Type = NotificationType.LowStock,
                            Title = "Низкий остаток",
                            Message = $"{ingredient.Name}: осталось {stock.Quantity:N2} {unitName} (мин. {ingredient.MinStock:N2} {unitName})",
                            BranchId = stock.BranchId,
                            RelatedEntityType = "Ingredient",
                            RelatedEntityId = ingredient.Id,
                            IsRead = false,
                            CreatedAt = DateTime.UtcNow
                        };

                        _dbContext.Set<Notification>().Add(notification);
                    }
                }
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task GenerateExpiringNotificationsAsync(CancellationToken cancellationToken = default)
    {
        // Get recent ingredient receipts with shelf life
        var receipts = await _dbContext.Set<IngredientReceipt>()
            .Include(r => r.Ingredient)
            .Include(r => r.Branch)
            .Where(r => r.Ingredient != null && r.Ingredient.ShelfLifeDays != null)
            .ToListAsync(cancellationToken);

        foreach (var receipt in receipts)
        {
            if (receipt.Ingredient?.ShelfLifeDays == null) continue;

            var expiryDate = receipt.ReceiptDate.AddDays(receipt.Ingredient.ShelfLifeDays.Value);
            var daysUntilExpiry = (expiryDate - DateTime.UtcNow).Days;

            // Notify if expiring within 7 days
            if (daysUntilExpiry > 0 && daysUntilExpiry <= 7)
            {
                var existingNotification = await _dbContext.Set<Notification>()
                    .Where(n => n.Type == NotificationType.ExpiringIngredient
                        && n.RelatedEntityType == "IngredientReceipt"
                        && n.RelatedEntityId == receipt.Id
                        && n.CreatedAt.Date == DateTime.UtcNow.Date)
                    .FirstOrDefaultAsync(cancellationToken);

                if (existingNotification == null)
                {
                    var notification = new Notification
                    {
                        Type = NotificationType.ExpiringIngredient,
                        Title = "Срок годности",
                        Message = $"{receipt.Ingredient.Name} истекает через {daysUntilExpiry} дн.",
                        BranchId = receipt.BranchId,
                        RelatedEntityType = "IngredientReceipt",
                        RelatedEntityId = receipt.Id,
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    };

                    _dbContext.Set<Notification>().Add(notification);
                }
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static NotificationDto MapToDto(Notification entity)
    {
        return new NotificationDto
        {
            Id = entity.Id,
            Type = entity.Type,
            Title = entity.Title,
            Message = entity.Message,
            IsRead = entity.IsRead,
            UserId = entity.UserId,
            BranchId = entity.BranchId,
            BranchName = entity.Branch?.Name,
            RelatedEntityType = entity.RelatedEntityType,
            RelatedEntityId = entity.RelatedEntityId,
            CreatedAt = entity.CreatedAt
        };
    }
}
