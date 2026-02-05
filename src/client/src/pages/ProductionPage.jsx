import { Factory } from 'lucide-react';
import PageStub from '../components/shared/PageStub';

export default function ProductionPage() {
  return (
    <PageStub
      title="Производственные партии"
      description="Учёт производства лимонада, списание сырья, контроль выхода продукции"
      icon={Factory}
    />
  );
}
