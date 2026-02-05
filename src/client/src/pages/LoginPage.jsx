import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/auth';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login: authLogin, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!login || !password) return;

    const success = await authLogin(login, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--primary))] flex items-center justify-center mb-4">
            <Droplets className="w-8 h-8 text-[hsl(var(--primary-foreground))]" />
          </div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Лимонад
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Система учёта производства
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-[hsl(var(--card))] rounded-xl shadow-lg border border-[hsl(var(--border))] p-6">
          <h2 className="text-lg font-medium text-[hsl(var(--card-foreground))] mb-6">
            Вход в систему
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Login Field */}
            <div>
              <label
                htmlFor="login"
                className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
              >
                Логин
              </label>
              <input
                id="login"
                type="text"
                value={login}
                onChange={(e) => { setLogin(e.target.value); clearError(); }}
                placeholder="Введите логин"
                disabled={isLoading}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))]
                         bg-[hsl(var(--background))] text-[hsl(var(--foreground))]
                         placeholder:text-[hsl(var(--muted-foreground))]
                         focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent
                         disabled:opacity-50 transition-colors"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
              >
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                placeholder="Введите пароль"
                disabled={isLoading}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))]
                         bg-[hsl(var(--background))] text-[hsl(var(--foreground))]
                         placeholder:text-[hsl(var(--muted-foreground))]
                         focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent
                         disabled:opacity-50 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !login || !password}
              className="w-full py-2.5 px-4 rounded-lg font-medium
                       bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]
                       hover:opacity-90 active:opacity-80
                       focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-opacity flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Вход...
                </>
              ) : (
                'Войти'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-[hsl(var(--muted-foreground))] mt-6">
          Система учёта и управления лимонадным производством
        </p>
      </div>
    </div>
  );
}
