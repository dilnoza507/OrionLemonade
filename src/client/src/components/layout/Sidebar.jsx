import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GlassWater,
  BookOpen,
  Factory,
  Package,
  RotateCcw,
  Users,
  Wallet,
  Calculator,
  BarChart3,
  UserCog,
  Settings,
  DollarSign,
  ChevronDown,
  ShoppingCart,
  Truck,
  ClipboardList,
  ScrollText,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/auth';
import { canAccessMenu } from '../../config/permissions';

// Menu item component with permission check
function MenuItem({ to, icon: Icon, children, menuKey, onNavigate }) {
  const userRole = useAuthStore((state) => state.user?.role);

  if (menuKey && !canAccessMenu(userRole, menuKey)) {
    return null;
  }

  return (
    <NavLink
      to={to}
      onClick={onNavigate}
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

// Menu group with collapsible items and permission check
function MenuGroup({ icon: Icon, label, children, defaultOpen = false, menuKey }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const userRole = useAuthStore((state) => state.user?.role);

  // Filter children to only include those that have permission
  const visibleChildren = children?.filter(child => {
    if (!child) return false;
    return true; // Let individual items handle their own permission
  });

  // If menuKey is specified and user doesn't have access, hide the group
  if (menuKey && !canAccessMenu(userRole, menuKey)) {
    return null;
  }

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

// Sub menu item (for groups) with permission check
function SubMenuItem({ to, children, menuKey, onNavigate }) {
  const userRole = useAuthStore((state) => state.user?.role);

  if (menuKey && !canAccessMenu(userRole, menuKey)) {
    return null;
  }

  return (
    <NavLink
      to={to}
      onClick={onNavigate}
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

export default function Sidebar({ isOpen, onClose }) {
  const userRole = useAuthStore((state) => state.user?.role);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose?.();
  }, [location.pathname]);

  // Check if any items in a section are visible
  const hasProductionAccess = canAccessMenu(userRole, 'recipes') || canAccessMenu(userRole, 'production');
  const hasWarehouseAccess = canAccessMenu(userRole, 'warehouse');
  const hasSalesAccess = canAccessMenu(userRole, 'sales') || canAccessMenu(userRole, 'clients');
  const hasFinanceAccess = canAccessMenu(userRole, 'expenses') || canAccessMenu(userRole, 'payroll');
  const hasSettingsAccess = canAccessMenu(userRole, 'settings/users') || canAccessMenu(userRole, 'settings/branches') || canAccessMenu(userRole, 'employees') || canAccessMenu(userRole, 'settings/audit-log');

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center">
            <GlassWater className="w-5 h-5 text-[hsl(var(--primary-foreground))]" />
          </div>
          <div>
            <h1 className="font-semibold text-[hsl(var(--foreground))]">Лимонад</h1>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Система учёта</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
        >
          <X className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Основное */}
        <MenuItem to="/dashboard" icon={LayoutDashboard} menuKey="dashboard" onNavigate={onClose}>
          Главная
        </MenuItem>

        {/* Производство */}
        {hasProductionAccess && <MenuLabel>Производство</MenuLabel>}
        <MenuItem to="/recipes" icon={BookOpen} menuKey="recipes" onNavigate={onClose}>
          Рецептуры
        </MenuItem>
        <MenuItem to="/production" icon={Factory} menuKey="production" onNavigate={onClose}>
          Партии
        </MenuItem>

        {/* Склад */}
        {hasWarehouseAccess && <MenuLabel>Склад</MenuLabel>}
        {hasWarehouseAccess && (
          <MenuGroup icon={Package} label="Склад" defaultOpen menuKey="warehouse">
            <SubMenuItem to="/settings/ingredients" menuKey="settings/ingredients" onNavigate={onClose}>Сырьё и материалы</SubMenuItem>
            <SubMenuItem to="/warehouse/materials" onNavigate={onClose}>Остатки</SubMenuItem>
            <SubMenuItem to="/warehouse/products" menuKey="products" onNavigate={onClose}>Готовая продукция</SubMenuItem>
            <SubMenuItem to="/warehouse/transfers" menuKey="transfers" onNavigate={onClose}>Трансферы</SubMenuItem>
            <SubMenuItem to="/warehouse/inventory" onNavigate={onClose}>Инвентаризация</SubMenuItem>
          </MenuGroup>
        )}

        {/* Продажи */}
        {hasSalesAccess && <MenuLabel>Продажи</MenuLabel>}
        <MenuItem to="/sales" icon={ShoppingCart} menuKey="sales" onNavigate={onClose}>
          Продажи
        </MenuItem>
        <MenuItem to="/returns" icon={RotateCcw} menuKey="sales" onNavigate={onClose}>
          Возвраты
        </MenuItem>
        <MenuItem to="/clients" icon={Users} menuKey="clients" onNavigate={onClose}>
          Клиенты
        </MenuItem>

        {/* Финансы */}
        {hasFinanceAccess && <MenuLabel>Финансы</MenuLabel>}
        <MenuItem to="/expenses" icon={Wallet} menuKey="expenses" onNavigate={onClose}>
          Расходы
        </MenuItem>
        <MenuItem to="/payroll" icon={Calculator} menuKey="payroll" onNavigate={onClose}>
          Зарплата
        </MenuItem>
        <MenuItem to="/settings/exchange-rates" icon={DollarSign} menuKey="settings/exchange-rates" onNavigate={onClose}>
          Курсы валют
        </MenuItem>

        {/* Отчёты */}
        <MenuLabel>Аналитика</MenuLabel>
        <MenuItem to="/reports" icon={BarChart3} menuKey="reports" onNavigate={onClose}>
          Отчёты
        </MenuItem>

        {/* Настройки */}
        {hasSettingsAccess && <MenuLabel>Настройки</MenuLabel>}
        {hasSettingsAccess && (
          <MenuGroup icon={Settings} label="Настройки">
            <SubMenuItem to="/settings/branches" menuKey="settings/branches" onNavigate={onClose}>Филиалы</SubMenuItem>
            <SubMenuItem to="/settings/employees" menuKey="employees" onNavigate={onClose}>Сотрудники</SubMenuItem>
            <SubMenuItem to="/settings/users" menuKey="settings/users" onNavigate={onClose}>Пользователи</SubMenuItem>
            <SubMenuItem to="/settings/suppliers" menuKey="settings/suppliers" onNavigate={onClose}>Поставщики</SubMenuItem>
            <SubMenuItem to="/settings/audit-log" menuKey="settings/audit-log" onNavigate={onClose}>Журнал событий</SubMenuItem>
          </MenuGroup>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[hsl(var(--border))]">
        <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
          v1.0.0
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="hidden lg:flex w-64 h-screen bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar — overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          {/* Drawer */}
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[hsl(var(--card))] flex flex-col shadow-xl animate-slide-in">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
