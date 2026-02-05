import { Calculator } from 'lucide-react';
import PageStub from '../components/shared/PageStub';

export default function PayrollPage() {
  return (
    <PageStub
      title="Зарплата"
      description="Табель, расчёт зарплаты, премии и штрафы, авансы"
      icon={Calculator}
    />
  );
}
