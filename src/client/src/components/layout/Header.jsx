import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, AlertTriangle, Package, Factory, ShoppingCart, CreditCard, Info } from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { getNotifications, markAsRead, markAllAsRead } from '../../api/notifications';

const NOTIFICATION_TYPES = {
  LowStock: { icon: Package, color: 'warning' },
  ProductionComplete: { icon: Factory, color: 'primary' },
  ExpiringIngredient: { icon: AlertTriangle, color: 'destructive' },
  NewSale: { icon: ShoppingCart, color: 'success' },
  PaymentReceived: { icon: CreditCard, color: 'success' },
  System: { icon: Info, color: 'muted-foreground' },
};

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Fetch notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications(true); // include read
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load notifications on mount and periodically
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.System;
    const Icon = config.icon;
    return <Icon className={`w-4 h-4 text-[hsl(var(--${config.color}))]`} />;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <header className="h-16 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] px-6 flex items-center justify-end">
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) loadNotifications();
            }}
            className="relative p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <Bell className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[hsl(var(--destructive))] rounded-full" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-lg z-50">
              <div className="flex items-center justify-between p-3 border-b border-[hsl(var(--border))]">
                <h3 className="font-semibold text-[hsl(var(--foreground))]">Уведомления</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-[hsl(var(--primary))] hover:underline"
                  >
                    Прочитать все
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                    Загрузка...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                    Нет уведомлений
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => handleMarkAsRead(notification.id)}
                      className={`p-3 border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-[hsl(var(--primary))]/5' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">
                            {notification.message}
                          </p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-[hsl(var(--border))]">
          <div className="text-right">
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
              {user?.name || 'Пользователь'}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Директор
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
            title="Выйти"
          >
            <LogOut className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          </button>
        </div>
      </div>
    </header>
  );
}
