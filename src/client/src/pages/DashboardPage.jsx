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

// Stat Card Component
function StatCard({ title, value, icon: Icon, description, trend }) {
  return (
    <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          {title}
        </span>
        {Icon && <Icon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
      </div>
      <div className="text-2xl font-bold text-[hsl(var(--card-foreground))]">
        {value}
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
function QuickAction({ icon: IconComponent, label }) {
  return (
    <button
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

export default function DashboardPage() {
  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
          Дашборд
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Обзор системы учёта лимонадного производства
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Выручка за месяц"
          value="125 430 смн."
          icon={DollarSign}
          description="+12% к прошлому месяцу"
          trend="up"
        />
        <StatCard
          title="Расходы за месяц"
          value="87 200 смн."
          icon={CreditCard}
          description="+3% к прошлому месяцу"
          trend="down"
        />
        <StatCard
          title="Чистая прибыль"
          value="38 230 смн."
          icon={TrendingUp}
          description="Маржа 30.5%"
          trend="up"
        />
        <StatCard
          title="Продаж"
          value="156"
          icon={ShoppingCart}
          description="За текущий месяц"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 mb-6">
        <h2 className="text-lg font-medium text-[hsl(var(--card-foreground))] mb-4">
          Быстрые действия
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <QuickAction icon={Factory} label="Новая партия" />
          <QuickAction icon={Package} label="Приход сырья" />
          <QuickAction icon={ShoppingCart} label="Новая продажа" />
          <QuickAction icon={Users} label="Новый клиент" />
          <QuickAction icon={FileText} label="Отчёты" />
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
            {[
              { text: 'Партия П-DSH-20260204-001 завершена', time: '10 мин назад' },
              { text: 'Продажа ПР-DSH-20260204-015 оплачена', time: '25 мин назад' },
              { text: 'Приход сырья: Сахар 500 кг', time: '1 час назад' },
              { text: 'Новый клиент: ООО "Ширин"', time: '2 часа назад' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))] last:border-0"
              >
                <span className="text-sm text-[hsl(var(--foreground))]">
                  {item.text}
                </span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  {item.time}
                </span>
              </div>
            ))}
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
            {[
              { text: 'Низкий остаток: Лимонная кислота (5 кг)', type: 'warning' },
              { text: 'Срок годности: Партия П-DSH-20260115-003', type: 'warning' },
              { text: 'Курс USD/TJS не установлен на сегодня', type: 'info' },
            ].map((item, i) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
