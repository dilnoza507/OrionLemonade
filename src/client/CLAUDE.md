# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Система учёта и управления лимонадным производством «Лимонад» — веб-приложение для сети лимонадных цехов с несколькими филиалами. Полный цикл: закупка сырья, производство, продажи, финансовый учёт, зарплата.

**Документация проекта:** `../../docs/`
- `ТЗ_Лимонад_FULL.md` — полное техническое задание
- `ER_Diagram.md` — схема базы данных

**Style Guide:** См. `STYLE_GUIDE.md` — библиотеки, компоненты, паттерны UI.

## Commands

```bash
npm run dev       # Development server with HMR
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Tech Stack

### Текущий (установлено)
- **React 19** + Vite 7
- **ESLint 9** с flat config

### Планируемый (к установке)
- **Shadcn/ui** + Tailwind CSS — UI компоненты
- **React Router 7** — маршрутизация
- **TanStack Query** — серверное состояние
- **Zustand** — клиентское состояние (филиал, пользователь)
- **React Hook Form** + Zod — формы и валидация
- **Recharts** — графики для дашборда

## Key Concepts

### Мультивалютность
- **USD** — закупка сырья, себестоимость (хранится в USD)
- **TJS (сомони)** — продажи, расходы, зарплата
- Курс устанавливается ежедневно, фиксируется в каждом документе

### Филиалы (Branches)
- Все операции привязаны к филиалу
- Справочники (рецептуры, ингредиенты, клиенты) — общие
- Склады, производство, продажи — раздельные по филиалам
- В Header — переключатель филиала

### Роли
| Роль | Доступ |
|------|--------|
| Директор | Всё + все филиалы |
| Бухгалтер | Финансы, зарплата, все филиалы |
| Менеджер | Продажи, клиенты, свои филиалы |
| Кладовщик | Склад, производство, свой филиал |

### Основные модули
1. Рецептуры (с версионированием)
2. Производство (партии, списание сырья)
3. Склад сырья (средневзвешенная цена в USD)
4. Склад готовой продукции (FEFO)
5. Продажи и клиенты
6. Расходы
7. Зарплата
8. Отчёты и дашборд

## Formatting Standards

```javascript
// Валюты
formatTJS(1234.56)  // → "1 234,56 смн."
formatUSD(1234.56)  // → "$1,234.56"

// Дата
formatDate(date)    // → "01.02.2026" (ДД.ММ.ГГГГ)

// Курс
formatExchangeRate(10.9)  // → "10,9000"
```

## Project Structure

### Текущая (Vite template)
```
src/
├── main.jsx        # Entry point
├── App.jsx         # Root component
├── App.css         # Component styles
├── index.css       # Global styles
└── assets/         # Static assets
```

### Целевая (к реализации)
```
src/
├── api/            # API клиент и эндпоинты
├── components/
│   ├── ui/         # Shadcn компоненты
│   ├── layout/     # Header, Sidebar, PageLayout
│   └── shared/     # StatusBadge, StatCard и др.
├── features/       # Модули по функционалу
│   ├── auth/
│   ├── branches/
│   ├── recipes/
│   ├── production/
│   ├── warehouse/
│   ├── sales/
│   ├── expenses/
│   ├── payroll/
│   └── reports/
├── hooks/          # usePermissions, useCurrentBranch
├── stores/         # Zustand (auth, branch)
├── lib/            # utils, formatters, constants
└── pages/          # Страницы-роуты
```
