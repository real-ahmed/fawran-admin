import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ShoppingCart, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DashboardMetrics } from '@/services/dashboardService';
import { OrderStatus } from '@/types/enums';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

interface DashboardChartsProps {
  metrics?: DashboardMetrics;
}

export const DashboardCharts = ({ metrics }: DashboardChartsProps) => {
  const { t } = useTranslation();
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

  return (
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
  );
};
