import { useQuery } from '@tanstack/react-query';
import { fetchDashboardMetrics, fetchPendingApprovals } from '@/services/dashboardService';
import { useTranslation } from 'react-i18next';
import { useFormatters } from '@/hooks/useFormatters';
import { Money } from '@/components/Money';
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
  RefreshCw,
} from 'lucide-react';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

// ─── Stat Card ──────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: React.ReactNode;
  tone: string;
}

const StatCard = ({ title, value, sub, icon, tone }: StatCardProps) => (
  <div className="group flex min-h-[124px] items-start gap-4 rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
    <div className={`rounded-md p-3 ${tone}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-muted-foreground truncate">{title}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  </div>
);

// ─── Pending Approvals ───────────────────────────────────────────────────────
const PendingList = ({ title, items, icon }: { title: string; items: { id: number; name: string }[]; icon: React.ReactNode }) => {
  const { t } = useTranslation();
  return (
  <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h3 className="font-semibold text-foreground">{title}</h3>
      <span className="ms-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        {items.length}
      </span>
    </div>
    {items.length === 0 ? (
      <div className="rounded-md border border-dashed border-border bg-muted/40 py-5 text-center">
        <CheckCircle className="mx-auto mb-2 h-5 w-5 text-primary" />
        <p className="text-sm text-muted-foreground">{t('no_pending_items')}</p>
      </div>
    ) : (
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{item.name}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
  );
};

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
          metrics?.orders.pending ?? 0,
          metrics?.orders.processing ?? 0,
          metrics?.orders.delivered ?? 0,
          metrics?.orders.cancelled ?? 0,
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
    return (
      <div className="space-y-6">
        <div className="h-16 rounded-lg bg-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-[124px] animate-pulse rounded-lg border border-border bg-card" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-lg border border-border bg-card" />
          <div className="h-80 animate-pulse rounded-lg border border-border bg-card" />
        </div>
      </div>
    );
  }

  if (metricsError) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <div className="max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-sm">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-amber-500" />
          <h1 className="text-lg font-semibold text-foreground">{t('dashboard')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('save_failed')}</p>
          <button
            type="button"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            onClick={() => refetchMetrics()}
          >
            <RefreshCw className="h-4 w-4" />
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('dashboard')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('dashboard_subtitle', 'Overview of your platform')}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
          <span className="h-2 w-2 rounded-full bg-primary" />
          {metricsFetching ? t('refreshing') : t('live')}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title={t('total_orders')}
          value={formatNumber(metrics?.orders.total ?? 0)}
          sub={`${formatNumber(metrics?.orders.pending ?? 0)} ${t('pending')}`}
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('pending'), value: formatNumber(metrics?.orders.pending), icon: <Clock className="h-4 w-4" />, color: 'text-amber-600 bg-amber-50' },
          { label: t('processing'), value: formatNumber(metrics?.orders.processing), icon: <Loader2 className="h-4 w-4" />, color: 'text-blue-600 bg-blue-50' },
          { label: t('delivered'), value: formatNumber(metrics?.orders.delivered), icon: <CheckCircle className="h-4 w-4" />, color: 'text-emerald-600 bg-emerald-50' },
          { label: t('cancelled'), value: formatNumber(metrics?.orders.cancelled), icon: <XCircle className="h-4 w-4" />, color: 'text-red-500 bg-red-50' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4 text-center shadow-sm">
            <div className={`inline-flex items-center justify-center p-2 rounded-full mb-2 ${color}`}>
              {icon}
            </div>
            <p className="text-xl font-bold text-foreground">{value ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          {t('pending_approvals')}
          {pendingLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground ms-1" />}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PendingList
            title={t('brands')}
            items={pending?.brands ?? []}
            icon={<Store className="h-4 w-4 text-primary" />}
          />
          <PendingList
            title={t('categories')}
            items={pending?.categories ?? []}
            icon={<ShoppingCart className="h-4 w-4 text-primary" />}
          />
          <PendingList
            title={t('couriers')}
            items={pending?.couriers ?? []}
            icon={<Truck className="h-4 w-4 text-primary" />}
          />
        </div>
      </div>
    </div>
  );
};
