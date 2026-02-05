import { Wallet } from 'lucide-react';
import PageStub from '../components/shared/PageStub';

export default function ExpensesPage() {
  return (
    <PageStub
      title="Расходы"
      description="Учёт расходов по статьям: сырьё, аренда, коммуналка, транспорт"
      icon={Wallet}
    />
  );
}
