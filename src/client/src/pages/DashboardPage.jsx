import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  ShoppingCart,
  Factory,
  Package,
  Users,
  FileText,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { getDashboardSummary } from '../api/dashboard';

// Stat Card Component
function StatCard({ title, value, icon: Icon, description, trend, loading }) {
  return (
    <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          {title}
        </span>
        {Icon && <Icon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
      </div>
      <div className="text-2xl font-bold text-[hsl(var(--card-foreground))]">
        {loading ? <span className="animate-pulse">...</span> : value}
      </div>
      {description && (
        <p className={`text-xs mt-1 ${trend === 'up' ? 'text-[hsl(var(--success))]' : trend === 'down' ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
          {description}
        </p>
      )}
    </div>
  );
}

// Quick Action Button
function QuickAction({ icon: IconComponent, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-lg
               bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))]/80
               transition-colors"
    >
      <IconComponent className="w-6 h-6 text-[hsl(var(--primary))]" />
      <span className="text-sm font-medium text-[hsl(var(--foreground))]">
        {label}
      </span>
    </button>
  );
}

// Format time ago
function formatTimeAgo(dateStr) {
  const date = new Date(dateStr);
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
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    revenue: { value: 0, change: 0, trend: 'up' },
    expenses: { value: 0 },
    profit: { value: 0, margin: 0 },
    salesCount: { value: 0 },
    recentOperations: [],
    alerts: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const summary = await getDashboardSummary();
      setData(summary);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
          Главная
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Обзор системы учёта лимонадного производства
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Выручка за месяц"
          value={`${data.revenue.value.toLocaleString()} TJS`}
          icon={DollarSign}
          description={data.revenue.change !== 0 ? `${data.revenue.change > 0 ? '+' : ''}${data.revenue.change}% к прошлому месяцу` : 'За текущий месяц'}
          trend={data.revenue.trend}
          loading={loading}
        />
        <StatCard
          title="Расходы за месяц"
          value={`${data.expenses.value.toLocaleString()} TJS`}
          icon={CreditCard}
          description="За текущий месяц"
          loading={loading}
        />
        <StatCard
          title="Чистая прибыль"
          value={`${data.profit.value.toLocaleString()} TJS`}
          icon={TrendingUp}
          description={`Маржа ${data.profit.margin}%`}
          trend={data.profit.value >= 0 ? 'up' : 'down'}
          loading={loading}
        />
        <StatCard
          title="Продаж"
          value={data.salesCount.value}
          icon={ShoppingCart}
          description="За текущий месяц"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 mb-6">
        <h2 className="text-lg font-medium text-[hsl(var(--card-foreground))] mb-4">
          Быстрые действия
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <QuickAction icon={Factory} label="Новая партия" onClick={() => navigate('/production')} />
          <QuickAction icon={Package} label="Приход сырья" onClick={() => navigate('/warehouse/materials')} />
          <QuickAction icon={ShoppingCart} label="Новая продажа" onClick={() => navigate('/sales')} />
          <QuickAction icon={Users} label="Новый клиент" onClick={() => navigate('/clients')} />
          <QuickAction icon={FileText} label="Отчёты" onClick={() => navigate('/reports')} />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            <h2 className="text-lg font-medium text-[hsl(var(--card-foreground))]">
              Последние операции
            </h2>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-[hsl(var(--muted-foreground))] animate-pulse">Загрузка...</div>
            ) : data.recentOperations.length === 0 ? (
              <div className="text-sm text-[hsl(var(--muted-foreground))]">Нет операций</div>
            ) : (
              data.recentOperations.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))] last:border-0"
                >
                  <span className="text-sm text-[hsl(var(--foreground))]">
                    {item.text}
                  </span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {formatTimeAgo(item.date)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-[hsl(var(--warning))]" />
            <h2 className="text-lg font-medium text-[hsl(var(--card-foreground))]">
              Предупреждения
            </h2>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-[hsl(var(--muted-foreground))] animate-pulse">Загрузка...</div>
            ) : data.alerts.length === 0 ? (
              <div className="text-sm text-[hsl(var(--success))] p-3 bg-[hsl(var(--success))]/10 rounded-lg">
                Нет предупреждений
              </div>
            ) : (
              data.alerts.map((item, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg text-sm ${
                    item.type === 'warning'
                      ? 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]'
                      : 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                  }`}
                >
                  {item.text}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
