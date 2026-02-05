import { ShoppingCart } from 'lucide-react';
import PageStub from '../components/shared/PageStub';

export default function SalesPage() {
  return (
    <PageStub
      title="Продажи"
      description="Учёт продаж, отгрузка продукции, контроль оплаты"
      icon={ShoppingCart}
    />
  );
}
