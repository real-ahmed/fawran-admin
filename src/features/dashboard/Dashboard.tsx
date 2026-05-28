import { useQuery } from '@tanstack/react-query';
import { fetchDashboardMetrics, fetchPendingApprovals } from '@/services/dashboardService';
import { useTranslation } from 'react-i18next';
import { useFormatters } from '@/hooks/useFormatters';
import { Money } from '@/components/Money';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { PendingApprovalsCard } from '@/features/dashboard/components/PendingApprovalsCard';
import { DashboardError, DashboardLoading } from '@/features/dashboard/components/DashboardStates';
import { OrderStatusSummary } from '@/features/dashboard/components/OrderStatusSummary';
import { PageHeader } from '@/components/PageHeader';
import { OrderStatus } from '@/types/enums';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  ShoppingCart, Store, Truck, DollarSign, Clock, CheckCircle, XCircle, Loader2, AlertTriangle,
} from 'lucide-react';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

// ─── Dashboard Page ──────────────────────────────────────────────────────────
export const Dashboard = () => {
  const { t } = useTranslation();
  const { formatNumber } = useFormatters();

  const {
    data: metrics,
    isLoading: metricsLoading,
    isError: metricsError,
    refetch: refetchMetrics,
    isFetching: metricsFetching,
  } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    refetchInterval: 60_000, // auto-refresh every minute
  });

  const { data: pending, isLoading: pendingLoading } = useQuery({
    queryKey: ['dashboard-pending'],
    queryFn: fetchPendingApprovals,
    refetchInterval: 60_000,
  });

  // ── Chart Data ──────────────────────────────────────────────────────────
  const ordersDonutData = {
    labels: [t('pending'), t('processing'), t('delivered'), t('cancelled')],
    datasets: [
      {
        data: [
          metrics?.orders[OrderStatus.Pending] ?? 0,
          metrics?.orders[OrderStatus.Processing] ?? 0,
          metrics?.orders[OrderStatus.Delivered] ?? 0,
          metrics?.orders[OrderStatus.Cancelled] ?? 0,
        ],
        backgroundColor: ['#f59e0b', '#3b82f6', '#606C38', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const couriersBarData = {
    labels: [t('total'), t('online'), t('pending_approval')],
    datasets: [
      {
        label: t('couriers'),
        data: [
          metrics?.couriers.total ?? 0,
          metrics?.couriers.online ?? 0,
          metrics?.couriers.pending_approval ?? 0,
        ],
        backgroundColor: ['#CCD5AE', '#606C38', '#f59e0b'],
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { padding: 16, boxWidth: 12 } },
    },
  };

  const barOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } },
    },
  };

  if (metricsLoading) {
    return <DashboardLoading />;
  }

  if (metricsError) {
    return <DashboardError onRetry={() => refetchMetrics()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard')}
        description={t('dashboard_subtitle')}
      >
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
          <span className="h-2 w-2 rounded-full bg-primary" />
          {metricsFetching ? t('refreshing') : t('live')}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title={t('total_orders')}
          value={formatNumber(metrics?.orders.total ?? 0)}
          sub={`${formatNumber(metrics?.orders[OrderStatus.Pending] ?? 0)} ${t('pending')}`}
          icon={<ShoppingCart className="h-5 w-5 text-blue-600" />}
          tone="bg-blue-50"
        />
        <StatCard
          title={t('total_revenue')}
          value={<Money amount={metrics?.revenue.total_revenue ?? 0} />}
          sub={<><span>{t('balance')}: </span><Money amount={metrics?.revenue.current_balance ?? 0} /></>}
          icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            {t('order_status_breakdown')}
          </h2>
          <div className="h-64">
            <Doughnut data={ordersDonutData} options={chartOptions} />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            {t('couriers_overview')}
          </h2>
          <div className="h-64">
            <Bar data={couriersBarData} options={barOptions} />
          </div>
        </div>
      </div>

      <OrderStatusSummary
        items={[
          { label: t('pending'), value: formatNumber(metrics?.orders[OrderStatus.Pending]), icon: <Clock className="h-4 w-4" />, color: 'text-amber-600 bg-amber-50' },
          { label: t('processing'), value: formatNumber(metrics?.orders[OrderStatus.Processing]), icon: <Loader2 className="h-4 w-4" />, color: 'text-blue-600 bg-blue-50' },
          { label: t('delivered'), value: formatNumber(metrics?.orders[OrderStatus.Delivered]), icon: <CheckCircle className="h-4 w-4" />, color: 'text-emerald-600 bg-emerald-50' },
          { label: t('cancelled'), value: formatNumber(metrics?.orders[OrderStatus.Cancelled]), icon: <XCircle className="h-4 w-4" />, color: 'text-red-500 bg-red-50' },
        ]}
      />

      <div>
        <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          {t('pending_approvals')}
          {pendingLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground ms-1" />}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PendingApprovalsCard
            title={t('brands')}
            items={pending?.brands ?? []}
            icon={<Store className="h-4 w-4 text-primary" />}
          />
          <PendingApprovalsCard
            title={t('categories')}
            items={pending?.categories ?? []}
            icon={<ShoppingCart className="h-4 w-4 text-primary" />}
          />
          <PendingApprovalsCard
            title={t('couriers')}
            items={pending?.couriers ?? []}
            icon={<Truck className="h-4 w-4 text-primary" />}
          />
        </div>
      </div>
    </div>
  );
};
