import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Building2, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../stores/auth';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-16 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] px-6 flex items-center justify-between">
      {/* Left side - Branch selector */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))]/80 transition-colors">
          <Building2 className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <span className="text-sm font-medium text-[hsl(var(--foreground))]">
            Цех Душанбе
          </span>
          <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
        </button>

        {/* Exchange rate display */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))]/50">
          <span className="text-xs text-[hsl(var(--muted-foreground))]">USD/TJS:</span>
          <span className="text-sm font-mono font-medium text-[hsl(var(--foreground))]">10.90</span>
        </div>
      </div>

      {/* Right side - Notifications & User */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
          <Bell className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[hsl(var(--destructive))] rounded-full" />
        </button>

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
