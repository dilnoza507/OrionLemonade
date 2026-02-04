# Frontend Style Guide — Система учёта «Лимонад»

Руководство по стилям, библиотекам и шаблонам для фронтенд-разработки.

---

## 1. Технологический стек

### Основные библиотеки

| Библиотека | Версия | Назначение |
|------------|--------|------------|
| **React** | 19.x | Основной UI-фреймворк |
| **Vite** | 7.x | Сборка и dev-сервер |
| **React Router** | 7.x | Маршрутизация |
| **TanStack Query** | 5.x | Управление серверным состоянием, кэширование |
| **Zustand** | 5.x | Клиентское состояние (выбранный филиал, пользователь) |
| **React Hook Form** | 7.x | Формы с валидацией |
| **Zod** | 3.x | Схемы валидации |

### UI-компоненты

| Библиотека | Назначение |
|------------|------------|
| **Shadcn/ui** | Базовые компоненты (Button, Input, Dialog, Table, Select) |
| **Tailwind CSS** | Utility-first стили |
| **Lucide React** | Иконки |
| **Recharts** | Графики и диаграммы для дашборда |
| **TanStack Table** | Таблицы с сортировкой, фильтрацией, пагинацией |
| **date-fns** | Работа с датами |
| **react-day-picker** | Выбор дат |

### Дополнительные утилиты

| Библиотека | Назначение |
|------------|------------|
| **clsx** / **tailwind-merge** | Условные классы |
| **xlsx** | Экспорт в Excel |
| **react-hot-toast** | Уведомления (toast) |
| **@tanstack/react-virtual** | Виртуализация длинных списков |

---

## 2. Структура проекта

```
src/
├── api/                    # API-клиент и эндпоинты
│   ├── client.js           # Axios/fetch конфигурация
│   ├── branches.js         # API филиалов
│   ├── recipes.js          # API рецептур
│   └── ...
├── components/
│   ├── ui/                 # Базовые UI-компоненты (shadcn)
│   ├── layout/             # Header, Sidebar, PageLayout
│   ├── forms/              # Переиспользуемые формы
│   ├── tables/             # Конфигурации таблиц
│   └── shared/             # Общие компоненты
├── features/               # Модули по функционалу
│   ├── auth/               # Авторизация
│   ├── branches/           # Филиалы
│   ├── recipes/            # Рецептуры
│   ├── production/         # Производство
│   ├── warehouse/          # Склад
│   ├── sales/              # Продажи
│   ├── expenses/           # Расходы
│   ├── payroll/            # Зарплата
│   └── reports/            # Отчёты
├── hooks/                  # Кастомные хуки
├── lib/                    # Утилиты
│   ├── utils.js            # Общие функции
│   ├── formatters.js       # Форматирование валют, дат
│   └── constants.js        # Константы
├── stores/                 # Zustand stores
│   ├── auth.js             # Пользователь и роль
│   └── branch.js           # Выбранный филиал
├── styles/                 # Глобальные стили
└── pages/                  # Страницы (роуты)
```

---

## 3. Цветовая схема

### Основные цвета (CSS Variables)

```css
:root {
  /* Основные */
  --primary: 220 90% 56%;        /* Синий — основные действия */
  --primary-foreground: 0 0% 100%;

  /* Акценты */
  --success: 142 76% 36%;        /* Зелёный — успех, приход */
  --warning: 38 92% 50%;         /* Оранжевый — предупреждения */
  --destructive: 0 84% 60%;      /* Красный — ошибки, расход, удаление */

  /* Нейтральные */
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  --border: 214 32% 91%;

  /* Карточки */
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
}
```

### Семантическое использование

| Контекст | Цвет | Применение |
|----------|------|------------|
| Приход / Прибыль / Успех | `success` | Приход сырья, завершённые партии, оплаченные продажи |
| Расход / Убыток / Ошибка | `destructive` | Списание, брак, отмена, долги |
| Предупреждение | `warning` | Низкий остаток, истекающий срок годности |
| Информация | `primary` | Ссылки, кнопки действий |
| Нейтральные данные | `muted` | Фон таблиц, неактивные элементы |

---

## 4. Типографика

### Шрифты

```css
:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Размеры текста

| Элемент | Класс Tailwind | Размер |
|---------|---------------|--------|
| Заголовок страницы | `text-2xl font-semibold` | 24px |
| Заголовок карточки | `text-lg font-medium` | 18px |
| Обычный текст | `text-sm` | 14px |
| Мелкий текст / подписи | `text-xs text-muted-foreground` | 12px |
| Числа в таблицах | `text-sm font-mono tabular-nums` | 14px |

### Форматирование чисел и валют

```javascript
// lib/formatters.js

// Сомони (TJS)
export function formatTJS(amount) {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' смн.';
}
// Пример: 1 234,56 смн.

// Доллары (USD)
export function formatUSD(amount) {
  return '$' + new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
// Пример: $1,234.56

// Обе валюты (для сырья)
export function formatDualCurrency(usd, tjs) {
  return `${formatUSD(usd)} (${formatTJS(tjs)})`;
}
// Пример: $120.00 (1 308,00 смн.)

// Курс
export function formatExchangeRate(rate) {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(rate);
}

// Дата
export function formatDate(date) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}
// Пример: 01.02.2026

// Количество
export function formatQuantity(value, unit) {
  const formatted = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
  }).format(value);
  return `${formatted} ${unit}`;
}
```

---

## 5. Layout (Макет)

### Основная структура страницы

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
│ [Logo] [Филиал: Душанбе ▼] [Курс: 1 USD = 10.90 TJS] [User] │
├──────────┬──────────────────────────────────────────────────┤
│ SIDEBAR  │ CONTENT                                          │
│          │ ┌──────────────────────────────────────────────┐ │
│ Дашборд  │ │ Page Header                                  │ │
│ Рецептуры│ │ [Заголовок]              [Действия: + Создать]│ │
│ Произ-во │ ├──────────────────────────────────────────────┤ │
│ Склад ►  │ │ Filters (если есть)                          │ │
│ Продажи  │ │ [Дата с] [Дата по] [Статус ▼] [Применить]    │ │
│ Расходы  │ ├──────────────────────────────────────────────┤ │
│ Зарплата │ │ Content                                      │ │
│ Отчёты ► │ │ (Таблица / Форма / Карточки)                 │ │
│ Настройки│ │                                              │ │
│          │ └──────────────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────────┘
```

### Компонент PageLayout

```jsx
// components/layout/PageLayout.jsx
export function PageLayout({
  title,
  description,
  actions,
  filters,
  children
}) {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {/* Filters */}
      {filters && (
        <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
          {filters}
        </div>
      )}

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
```

### Ширина контента

| Контекст | Ширина | Класс |
|----------|--------|-------|
| Sidebar | 240px фиксированная | `w-60` |
| Content область | Fluid | `flex-1` |
| Максимальная ширина контента | 1400px | `max-w-7xl` |
| Форма (создание/редактирование) | 600px | `max-w-xl` |
| Модальное окно (маленькое) | 400px | `max-w-sm` |
| Модальное окно (большое) | 800px | `max-w-3xl` |

---

## 6. Компоненты

### 6.1 Кнопки

```jsx
// Вариации
<Button>Создать</Button>                           // Primary
<Button variant="secondary">Отмена</Button>        // Secondary
<Button variant="destructive">Удалить</Button>     // Destructive
<Button variant="outline">Экспорт</Button>         // Outline
<Button variant="ghost">Подробнее</Button>         // Ghost

// С иконкой
<Button>
  <Plus className="w-4 h-4 mr-2" />
  Добавить
</Button>

// Только иконка
<Button variant="ghost" size="icon">
  <Pencil className="w-4 h-4" />
</Button>

// Состояние загрузки
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
  Сохранить
</Button>
```

### 6.2 Формы

```jsx
// Стандартная форма с React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Обязательное поле'),
  quantity: z.number().positive('Должно быть положительным'),
  price_usd: z.number().min(0),
});

function IngredientForm({ onSubmit, defaultValues }) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Числовые поля с суффиксом валюты */}
        <FormField
          control={form.control}
          name="price_usd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Цена (USD)</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7 font-mono"
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary">Отмена</Button>
          <Button type="submit">Сохранить</Button>
        </div>
      </form>
    </Form>
  );
}
```

### 6.3 Таблицы

```jsx
// Стандартная таблица данных
import { DataTable } from '@/components/ui/data-table';

const columns = [
  {
    accessorKey: 'batch_number',
    header: '№ партии',
    cell: ({ row }) => (
      <span className="font-mono">{row.getValue('batch_number')}</span>
    ),
  },
  {
    accessorKey: 'production_date',
    header: 'Дата',
    cell: ({ row }) => formatDate(row.getValue('production_date')),
  },
  {
    accessorKey: 'cost_usd',
    header: () => <div className="text-right">Себестоимость (USD)</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {formatUSD(row.getValue('cost_usd'))}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
  },
  {
    id: 'actions',
    cell: ({ row }) => <RowActions row={row} />,
  },
];

// Использование
<DataTable
  columns={columns}
  data={batches}
  searchKey="batch_number"
  searchPlaceholder="Поиск по номеру партии..."
/>
```

### 6.4 Статус-бейджи

```jsx
// components/shared/StatusBadge.jsx
const statusConfig = {
  // Производственные партии
  planned: { label: 'Запланирована', variant: 'secondary' },
  in_progress: { label: 'В производстве', variant: 'warning' },
  completed: { label: 'Завершена', variant: 'success' },
  cancelled: { label: 'Отменена', variant: 'destructive' },

  // Продажи
  draft: { label: 'Черновик', variant: 'secondary' },
  confirmed: { label: 'Подтверждена', variant: 'default' },
  shipped: { label: 'Отгружена', variant: 'warning' },
  paid: { label: 'Оплачена', variant: 'success' },
  partially_paid: { label: 'Частично оплачена', variant: 'warning' },

  // Трансферы
  created: { label: 'Создан', variant: 'secondary' },
  in_transit: { label: 'В пути', variant: 'warning' },
  received: { label: 'Получен', variant: 'success' },
};

export function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
```

### 6.5 Карточки статистики (для дашборда)

```jsx
// components/shared/StatCard.jsx
export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className={cn(
            "flex items-center text-xs mt-1",
            trend === 'up' ? 'text-success' : 'text-destructive'
          )}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Использование
<div className="grid grid-cols-4 gap-4">
  <StatCard
    title="Выручка за месяц"
    value={formatTJS(revenue)}
    icon={DollarSign}
    trend="up"
    trendValue="+12% к прошлому месяцу"
  />
  <StatCard
    title="Расходы за месяц"
    value={formatTJS(expenses)}
    icon={CreditCard}
  />
  <StatCard
    title="Прибыль"
    value={formatTJS(profit)}
    icon={TrendingUp}
    trend={profit > 0 ? 'up' : 'down'}
  />
  <StatCard
    title="Продаж"
    value={salesCount}
    icon={ShoppingCart}
  />
</div>
```

---

## 7. Паттерны страниц

### 7.1 Страница списка (CRUD)

```jsx
// pages/ingredients/index.jsx
export default function IngredientsPage() {
  const { data, isLoading } = useIngredients();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <PageLayout
      title="Справочник ингредиентов"
      description="Сырьё, тара и упаковочные материалы"
      actions={
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить
        </Button>
      }
      filters={
        <>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="raw">Сырьё</SelectItem>
              <SelectItem value="packaging">Тара</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="archived">Архивные</SelectItem>
            </SelectContent>
          </Select>
        </>
      }
    >
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable columns={columns} data={data} />
      )}

      <CreateIngredientDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </PageLayout>
  );
}
```

### 7.2 Страница детали/редактирования

```jsx
// pages/production/[id].jsx
export default function ProductionBatchPage() {
  const { id } = useParams();
  const { data: batch, isLoading } = useProductionBatch(id);

  if (isLoading) return <PageSkeleton />;

  return (
    <PageLayout
      title={`Партия ${batch.batch_number}`}
      description={`${batch.recipe.name} • ${formatDate(batch.production_date)}`}
      actions={
        <>
          {batch.status === 'planned' && (
            <Button onClick={() => startProduction(batch.id)}>
              <Play className="w-4 h-4 mr-2" />
              Начать производство
            </Button>
          )}
          {batch.status === 'in_progress' && (
            <Button onClick={() => completeBatch(batch.id)}>
              <Check className="w-4 h-4 mr-2" />
              Завершить
            </Button>
          )}
        </>
      }
    >
      <div className="grid grid-cols-3 gap-6">
        {/* Основная информация */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Информация о партии</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">Рецептура</dt>
                <dd className="font-medium">{batch.recipe.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Статус</dt>
                <dd><StatusBadge status={batch.status} /></dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Себестоимость</dt>
                <dd className="font-mono">
                  {formatDualCurrency(batch.cost_usd, batch.cost_tjs)}
                </dd>
              </div>
              {/* ... */}
            </dl>
          </CardContent>
        </Card>

        {/* Боковая панель */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Printer className="w-4 h-4 mr-2" />
                Печать
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileDown className="w-4 h-4 mr-2" />
                Экспорт
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Таблица ингредиентов */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Состав партии</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            {/* ... */}
          </Table>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
```

### 7.3 Дашборд

```jsx
// pages/dashboard.jsx
export default function DashboardPage() {
  const { currentBranch } = useBranchStore();
  const { data: stats } = useDashboardStats(currentBranch?.id);
  const { data: exchangeRate } = useCurrentExchangeRate();

  return (
    <PageLayout title="Дашборд">
      {/* Статистика */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Выручка за месяц"
          value={formatTJS(stats?.revenue)}
          icon={DollarSign}
        />
        <StatCard
          title="Расходы за месяц"
          value={formatTJS(stats?.expenses)}
          icon={CreditCard}
        />
        <StatCard
          title="Чистая прибыль"
          value={formatTJS(stats?.profit)}
          icon={TrendingUp}
          trend={stats?.profit > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Текущий курс"
          value={`1 USD = ${formatExchangeRate(exchangeRate?.rate)} TJS`}
          description={`от ${formatDate(exchangeRate?.rate_date)}`}
          icon={RefreshCw}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Графики */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Выручка по дням</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={stats?.revenueByDay} />
          </CardContent>
        </Card>

        {/* Топ продуктов */}
        <Card>
          <CardHeader>
            <CardTitle>Топ-5 продуктов</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProductsList data={stats?.topProducts} />
          </CardContent>
        </Card>
      </div>

      {/* Предупреждения */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-warning" />
            <CardTitle className="text-base">Низкий остаток сырья</CardTitle>
          </CardHeader>
          <CardContent>
            <LowStockList data={stats?.lowStock} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center">
            <Clock className="w-4 h-4 mr-2 text-warning" />
            <CardTitle className="text-base">Истекает срок годности</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpiringProductsList data={stats?.expiringProducts} />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
```

---

## 8. Работа с API

### 8.1 API-клиент

```javascript
// api/client.js
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Автоматическое добавление токена
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Добавление branch_id для фильтрации по филиалу
  const branchId = useBranchStore.getState().currentBranch?.id;
  if (branchId && !config.params?.branch_id) {
    config.params = { ...config.params, branch_id: branchId };
  }

  return config;
});

// Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 8.2 TanStack Query хуки

```javascript
// hooks/useProduction.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';

export function useProductionBatches(filters) {
  return useQuery({
    queryKey: ['production-batches', filters],
    queryFn: () => api.get('/production/batches', { params: filters }).then(r => r.data),
  });
}

export function useProductionBatch(id) {
  return useQuery({
    queryKey: ['production-batch', id],
    queryFn: () => api.get(`/production/batches/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/production/batches', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-batches'] });
      toast.success('Партия создана');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Ошибка при создании');
    },
  });
}
```

---

## 9. Особенности мультивалютности

### Отображение сумм

```jsx
// Для сырья — обе валюты
<span className="font-mono">
  {formatUSD(item.price_usd)}
  <span className="text-muted-foreground ml-1">
    ({formatTJS(item.price_tjs)})
  </span>
</span>

// Для продаж, расходов — только TJS
<span className="font-mono">{formatTJS(sale.total_tjs)}</span>

// В колонках таблиц с выравниванием
<div className="text-right">
  <div className="font-mono">{formatUSD(row.cost_usd)}</div>
  <div className="text-xs text-muted-foreground font-mono">
    {formatTJS(row.cost_tjs)}
  </div>
</div>
```

### Отображение курса в Header

```jsx
// components/layout/Header.jsx
function ExchangeRateDisplay() {
  const { data: rate, isStale } = useCurrentExchangeRate();

  return (
    <div className={cn(
      "flex items-center gap-1 text-sm px-3 py-1.5 rounded-md",
      isStale ? "bg-warning/10 text-warning" : "bg-muted"
    )}>
      <RefreshCw className="w-3 h-3" />
      <span>1 USD = {formatExchangeRate(rate?.rate)} TJS</span>
      {isStale && (
        <Tooltip content="Курс не установлен на сегодня">
          <AlertTriangle className="w-3 h-3" />
        </Tooltip>
      )}
    </div>
  );
}
```

---

## 10. Переключатель филиала

```jsx
// components/layout/BranchSelector.jsx
export function BranchSelector() {
  const { currentBranch, setCurrentBranch, branches } = useBranchStore();
  const { user } = useAuthStore();

  // Директор и бухгалтер видят "Все филиалы"
  const showAllOption = ['director', 'accountant'].includes(user?.role);

  return (
    <Select
      value={currentBranch?.id?.toString() || 'all'}
      onValueChange={(value) => {
        if (value === 'all') {
          setCurrentBranch(null);
        } else {
          const branch = branches.find(b => b.id === parseInt(value));
          setCurrentBranch(branch);
        }
      }}
    >
      <SelectTrigger className="w-[200px]">
        <Building2 className="w-4 h-4 mr-2" />
        <SelectValue placeholder="Выберите филиал" />
      </SelectTrigger>
      <SelectContent>
        {showAllOption && (
          <SelectItem value="all">
            <span className="font-medium">Все филиалы</span>
          </SelectItem>
        )}
        {branches.map(branch => (
          <SelectItem key={branch.id} value={branch.id.toString()}>
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

---

## 11. Уведомления

```jsx
// components/layout/NotificationBell.jsx
export function NotificationBell() {
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-semibold">Уведомления</h4>
        </div>
        <ScrollArea className="h-80">
          {notifications?.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({ notification }) {
  const typeStyles = {
    info: 'border-l-primary',
    warning: 'border-l-warning',
    critical: 'border-l-destructive',
  };

  return (
    <div className={cn(
      "p-4 border-b border-l-4 hover:bg-muted/50 cursor-pointer",
      typeStyles[notification.notification_type],
      !notification.is_read && "bg-muted/30"
    )}>
      <p className="text-sm">{notification.message}</p>
      <span className="text-xs text-muted-foreground">
        {formatDate(notification.created_at)}
      </span>
    </div>
  );
}
```

---

## 12. Права доступа (UI)

```jsx
// hooks/usePermissions.js
import { useAuthStore } from '@/stores/auth';

const permissions = {
  director: {
    branches: ['view', 'manage', 'switch_all'],
    recipes: ['view', 'create', 'edit'],
    production: ['view', 'create'],
    warehouse: ['view', 'manage'],
    sales: ['view', 'create'],
    expenses: ['view', 'create'],
    payroll: ['view', 'calculate', 'approve'],
    reports: ['all'],
    settings: ['all'],
  },
  accountant: {
    branches: ['switch_all'],
    production: ['view_summary'],
    warehouse: ['view'],
    sales: ['view'],
    expenses: ['view', 'create'],
    payroll: ['view', 'calculate'],
    reports: ['financial'],
  },
  manager: {
    branches: ['switch_own'],
    recipes: ['view_list'],
    warehouse: ['view_finished'],
    sales: ['view', 'create'],
    clients: ['view', 'manage'],
    reports: ['sales'],
  },
  storekeeper: {
    warehouse: ['view', 'receipt', 'writeoff', 'inventory'],
    production: ['view', 'create'],
    transfers: ['create', 'receive'],
    reports: ['warehouse'],
  },
};

export function usePermissions() {
  const { user } = useAuthStore();
  const role = user?.role || 'guest';

  const can = (module, action) => {
    const rolePermissions = permissions[role]?.[module] || [];
    return rolePermissions.includes(action) || rolePermissions.includes('all');
  };

  return { can, role };
}

// Использование в компонентах
function SidebarNav() {
  const { can } = usePermissions();

  return (
    <nav>
      <NavItem to="/dashboard" icon={LayoutDashboard}>Дашборд</NavItem>

      {can('recipes', 'view') && (
        <NavItem to="/recipes" icon={Book}>Рецептуры</NavItem>
      )}

      {can('production', 'view') && (
        <NavItem to="/production" icon={Factory}>Производство</NavItem>
      )}

      {/* ... */}
    </nav>
  );
}

// Защита действий
function CreateBatchButton() {
  const { can } = usePermissions();

  if (!can('production', 'create')) return null;

  return (
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Создать партию
    </Button>
  );
}
```

---

## 13. Установка зависимостей

```bash
# Основные библиотеки
npm install react-router-dom @tanstack/react-query zustand react-hook-form @hookform/resolvers zod

# UI компоненты (shadcn/ui устанавливается через CLI)
npx shadcn@latest init
npx shadcn@latest add button input select dialog table card badge form toast

# Утилиты
npm install tailwind-merge clsx lucide-react date-fns

# Графики и таблицы
npm install recharts @tanstack/react-table

# Экспорт
npm install xlsx

# Уведомления
npm install react-hot-toast

# HTTP клиент
npm install axios
```

---

## 14. Чеклист при создании новой страницы

1. [ ] Создать файл страницы в `pages/`
2. [ ] Добавить маршрут в роутер
3. [ ] Использовать `PageLayout` для структуры
4. [ ] Создать API-хуки в `hooks/`
5. [ ] Добавить колонки таблицы (если список)
6. [ ] Добавить форму (если CRUD)
7. [ ] Проверить права доступа (`usePermissions`)
8. [ ] Добавить пункт в сайдбар (если нужно)
9. [ ] Добавить обработку loading/error состояний
10. [ ] Проверить работу с контекстом филиала
