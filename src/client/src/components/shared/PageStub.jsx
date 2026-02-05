import { Construction } from 'lucide-react';

export default function PageStub({ title, description, icon: Icon = Construction }) {
  return (
    <div className="h-full flex flex-col">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">{title}</h1>
        {description && (
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{description}</p>
        )}
      </div>

      {/* Placeholder content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
          </div>
          <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">
            Страница в разработке
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md">
            Этот раздел скоро будет доступен. Мы работаем над его реализацией.
          </p>
        </div>
      </div>
    </div>
  );
}
