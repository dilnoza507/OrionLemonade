import { PackageCheck } from 'lucide-react';
import PageStub from '../components/shared/PageStub';

export default function ProductsPage() {
  return (
    <PageStub
      title="Готовая продукция"
      description="Остатки готовой продукции по партиям, сроки годности"
      icon={PackageCheck}
    />
  );
}
