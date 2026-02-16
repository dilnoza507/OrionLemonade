import { useEffect } from 'react';

const PAGE_TITLES = {
  '/dashboard': 'Главная',
  '/recipes': 'Рецептуры',
  '/production': 'Производство',
  '/warehouse/materials': 'Склад - Остатки',
  '/warehouse/products': 'Готовая продукция',
  '/warehouse/transfers': 'Трансферы',
  '/warehouse/inventory': 'Инвентаризация',
  '/sales': 'Продажи',
  '/returns': 'Возвраты',
  '/clients': 'Клиенты',
  '/expenses': 'Расходы',
  '/payroll': 'Зарплата',
  '/reports': 'Отчёты',
  '/settings/branches': 'Филиалы',
  '/settings/employees': 'Сотрудники',
  '/settings/users': 'Пользователи',
  '/settings/exchange-rates': 'Курсы валют',
  '/settings/ingredients': 'Сырьё и материалы',
  '/settings/suppliers': 'Поставщики',
};

export function usePageTitle(pathname) {
  useEffect(() => {
    const title = PAGE_TITLES[pathname] || 'Лимонад';
    document.title = `${title} | Лимонад`;
  }, [pathname]);
}
