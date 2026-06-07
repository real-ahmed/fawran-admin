import { Package, ShoppingCart, Store, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DashboardMetrics } from '@/services/dashboardService';
import { OrderStatus } from '@/types/enums';
import { StatCard } from './StatCard';

interface DashboardStatsGridProps {
  metrics?: DashboardMetrics;
  formatNumber: (value?: number | string | null) => string;
}

export const DashboardStatsGrid = ({ metrics, formatNumber }: DashboardStatsGridProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        title={t('total_orders')}
        value={formatNumber(metrics?.orders.total ?? 0)}
        sub={`${formatNumber(metrics?.orders[OrderStatus.Pending] ?? 0)} ${t('pending')}`}
        icon={<ShoppingCart className="h-5 w-5 text-blue-600" />}
        tone="bg-blue-50"
      />
      <StatCard
        title={t('total_products')}
        value={formatNumber(metrics?.orders.total_products ?? 0)}
        sub={t('products')}
        icon={<Package className="h-5 w-5 text-emerald-600" />}
        tone="bg-emerald-50"
      />
      <StatCard
        title={t('vendors')}
        value={formatNumber(metrics?.vendors.total ?? 0)}
        sub={`${formatNumber(metrics?.vendors.active ?? 0)} ${t('active')}`}
        icon={<Store className="h-5 w-5 text-primary" />}
        tone="bg-primary/10"
      />
      <StatCard
        title={t('couriers')}
        value={formatNumber(metrics?.couriers.total ?? 0)}
        sub={`${formatNumber(metrics?.couriers.online ?? 0)} ${t('online')}`}
        icon={<Truck className="h-5 w-5 text-amber-600" />}
        tone="bg-amber-50"
      />
    </div>
  );
};
