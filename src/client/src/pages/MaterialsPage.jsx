import { Package } from 'lucide-react';
import PageStub from '../components/shared/PageStub';

export default function MaterialsPage() {
  return (
    <PageStub
      title="Сырьё и материалы"
      description="Остатки, приход и списание сырья, средневзвешенные цены в USD"
      icon={Package}
    />
  );
}
