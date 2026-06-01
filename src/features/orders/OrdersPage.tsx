import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { OrdersTabbedList } from './components/OrdersTabbedList';

export const OrdersPage = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('orders')}
        description={t('orders_description')}
      />
      <OrdersTabbedList />
    </div>
  );
};
