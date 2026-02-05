import { UserCog } from 'lucide-react';
import PageStub from '../../components/shared/PageStub';

export default function EmployeesPage() {
  return (
    <PageStub
      title="Сотрудники"
      description="Справочник сотрудников, должности, ставки оплаты"
      icon={UserCog}
    />
  );
}
