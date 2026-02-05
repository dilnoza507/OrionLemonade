import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Droplets,
  BookOpen,
  Factory,
  Package,
  PackageCheck,
  ArrowLeftRight,
  ShoppingCart,
  Users,
  Wallet,
  Calculator,
  BarChart3,
  Building2,
  UserCog,
  Settings,
  DollarSign,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

// Menu item component
function MenuItem({ to, icon: Icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive
          ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
          : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      {children}
    </NavLink>
  );
}

// Menu group with collapsible items
function MenuGroup({ icon: Icon, label, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium
                   text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]
                   transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          {label}
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1 border-l border-[hsl(var(--border))] pl-3">
          {children}
        </div>
      )}
    </div>
  );
}

// Sub menu item (for groups)
function SubMenuItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-3 py-1.5 rounded-lg text-sm transition-colors
        ${isActive
          ? 'text-[hsl(var(--primary))] font-medium'
          : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

// Menu section label
function MenuLabel({ children }) {
  return (
    <div className="px-3 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
      {children}
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center">
            <Droplets className="w-5 h-5 text-[hsl(var(--primary-foreground))]" />
          </div>
          <div>
            <h1 className="font-semibold text-[hsl(var(--foreground))]">Лимонад</h1>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Система учёта</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Основное */}
        <MenuItem to="/dashboard" icon={LayoutDashboard}>
          Дашборд
        </MenuItem>

        {/* Производство */}
        <MenuLabel>Производство</MenuLabel>
        <MenuItem to="/recipes" icon={BookOpen}>
          Рецептуры
        </MenuItem>
        <MenuItem to="/production" icon={Factory}>
          Партии
        </MenuItem>

        {/* Склад */}
        <MenuLabel>Склад</MenuLabel>
        <MenuGroup icon={Package} label="Склад" defaultOpen>
          <SubMenuItem to="/warehouse/materials">Сырьё и материалы</SubMenuItem>
          <SubMenuItem to="/warehouse/products">Готовая продукция</SubMenuItem>
          <SubMenuItem to="/warehouse/transfers">Трансферы</SubMenuItem>
        </MenuGroup>

        {/* Продажи */}
        <MenuLabel>Продажи</MenuLabel>
        <MenuItem to="/sales" icon={ShoppingCart}>
          Продажи
        </MenuItem>
        <MenuItem to="/clients" icon={Users}>
          Клиенты
        </MenuItem>

        {/* Финансы */}
        <MenuLabel>Финансы</MenuLabel>
        <MenuItem to="/expenses" icon={Wallet}>
          Расходы
        </MenuItem>
        <MenuItem to="/payroll" icon={Calculator}>
          Зарплата
        </MenuItem>

        {/* Отчёты */}
        <MenuLabel>Аналитика</MenuLabel>
        <MenuItem to="/reports" icon={BarChart3}>
          Отчёты
        </MenuItem>

        {/* Настройки */}
        <MenuLabel>Настройки</MenuLabel>
        <MenuGroup icon={Settings} label="Настройки">
          <SubMenuItem to="/settings/branches">Филиалы</SubMenuItem>
          <SubMenuItem to="/settings/employees">Сотрудники</SubMenuItem>
          <SubMenuItem to="/settings/users">Пользователи</SubMenuItem>
          <SubMenuItem to="/settings/exchange-rates">Курсы валют</SubMenuItem>
        </MenuGroup>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[hsl(var(--border))]">
        <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
          v1.0.0
        </p>
      </div>
    </aside>
  );
}
