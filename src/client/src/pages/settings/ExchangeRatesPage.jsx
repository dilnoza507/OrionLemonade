import { DollarSign } from 'lucide-react';
import PageStub from '../../components/shared/PageStub';

export default function ExchangeRatesPage() {
  return (
    <PageStub
      title="Курсы валют"
      description="Управление курсом USD/TJS, история курсов"
      icon={DollarSign}
    />
  );
}
