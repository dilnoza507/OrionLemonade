import { BookOpen } from 'lucide-react';
import PageStub from '../components/shared/PageStub';

export default function RecipesPage() {
  return (
    <PageStub
      title="Рецептуры"
      description="Справочник рецептов лимонадов с ингредиентами и себестоимостью"
      icon={BookOpen}
    />
  );
}
