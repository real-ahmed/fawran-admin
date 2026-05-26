import { useQuery } from '@tanstack/react-query';
import { fetchDashboardMetrics, fetchPendingApprovals } from '@/services/dashboardService';
import { useTranslation } from 'react-i18next';
import { useAppConfig } from '@/hooks/useAppConfig';
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
} from 'lucide-react';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

// ─── Stat Card ──────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, sub, icon, color }: StatCardProps) => (
  <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-lg ${color}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-muted-foreground truncate">{title}</p>
      <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  </div>
);

// ─── Pending Approvals ───────────────────────────────────────────────────────
const PendingList = ({ title, items, icon }: { title: string; items: { id: number; name: string }[]; icon: React.ReactNode }) => {
  const { t } = useTranslation();
  return (
  <div className="bg-card border border-border rounded-xl p-5">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h3 className="font-semibold text-foreground">{title}</h3>
      <span className="ms-auto bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
        {items.length}
      </span>
    </div>
    {items.length === 0 ? (
      <p className="text-sm text-muted-foreground text-center py-4">{t('no_pending_items')}</p>
    ) : (
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 text-sm text-foreground border-b border-border pb-2 last:border-0 last:pb-0">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            {item.name}
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

  const { data: metrics, isLoading: metricsLoading } = useQuery({
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('dashboard')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('dashboard_subtitle', 'Overview of your platform')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title={t('total_orders')}
          value={formatNumber(metrics?.orders.total ?? 0)}
          sub={`${formatNumber(metrics?.orders.pending ?? 0)} ${t('pending')}`}
          icon={<ShoppingCart className="h-5 w-5 text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          title={t('total_revenue')}
          value={<Money amount={metrics?.revenue.total_revenue ?? 0} />}
          sub={<><span>{t('balance')}: </span><Money amount={metrics?.revenue.current_balance ?? 0} /></>}
          icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
          color="bg-emerald-50"
        />
        <StatCard
          title={t('vendors')}
          value={formatNumber(metrics?.vendors.total ?? 0)}
          sub={`${formatNumber(metrics?.vendors.active ?? 0)} ${t('active')}`}
          icon={<Store className="h-5 w-5 text-primary" />}
          color="bg-primary/10"
        />
        <StatCard
          title={t('couriers')}
          value={formatNumber(metrics?.couriers.total ?? 0)}
          sub={`${formatNumber(metrics?.couriers.online ?? 0)} ${t('online')}`}
          icon={<Truck className="h-5 w-5 text-amber-600" />}
          color="bg-amber-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Orders Donut */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            {t('order_status_breakdown')}
          </h2>
          <div className="h-64">
            <Doughnut data={ordersDonutData} options={chartOptions} />
          </div>
        </div>

        {/* Couriers Bar */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            {t('couriers_overview')}
          </h2>
          <div className="h-64">
            <Bar data={couriersBarData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Order Status Detail Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('pending'), value: formatNumber(metrics?.orders.pending), icon: <Clock className="h-4 w-4" />, color: 'text-amber-600 bg-amber-50' },
          { label: t('processing'), value: formatNumber(metrics?.orders.processing), icon: <Loader2 className="h-4 w-4" />, color: 'text-blue-600 bg-blue-50' },
          { label: t('delivered'), value: formatNumber(metrics?.orders.delivered), icon: <CheckCircle className="h-4 w-4" />, color: 'text-emerald-600 bg-emerald-50' },
          { label: t('cancelled'), value: formatNumber(metrics?.orders.cancelled), icon: <XCircle className="h-4 w-4" />, color: 'text-red-500 bg-red-50' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className={`inline-flex items-center justify-center p-2 rounded-full mb-2 ${color}`}>
              {icon}
            </div>
            <p className="text-xl font-bold text-foreground">{value ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending Approvals */}
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
