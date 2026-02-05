import { Users } from 'lucide-react';
import PageStub from '../components/shared/PageStub';

export default function ClientsPage() {
  return (
    <PageStub
      title="Клиенты"
      description="Справочник клиентов, контакты, прайс-листы, история заказов"
      icon={Users}
    />
  );
}
