import { BarChart3 } from 'lucide-react';
import PageStub from '../components/shared/PageStub';

export default function ReportsPage() {
  return (
    <PageStub
      title="Отчёты"
      description="Аналитика по производству, продажам, финансам. Экспорт в Excel"
      icon={BarChart3}
    />
  );
}
