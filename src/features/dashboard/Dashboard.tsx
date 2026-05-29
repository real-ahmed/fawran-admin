import { useTranslation } from 'react-i18next';
import { useFormatters } from '@/hooks/useFormatters';
import { DashboardError, DashboardLoading } from '@/features/dashboard/components/DashboardStates';
import { OrderStatusSummary } from '@/features/dashboard/components/OrderStatusSummary';
import { CourierApprovalModal } from '@/features/couriers/components/CourierApprovalModal';
import { PageHeader } from '@/components/PageHeader';
import { OrderStatus } from '@/types/enums';
import { CheckCircle, Clock, Loader2, XCircle } from 'lucide-react';
import { DashboardStatsGrid } from './components/DashboardStatsGrid';
import { DashboardCharts } from './components/DashboardCharts';
import { PendingApprovalsSection } from './components/PendingApprovalsSection';
import { useDashboardOverview } from './hooks/useDashboardOverview';

export const Dashboard = () => {
  const { t } = useTranslation();
  const { formatNumber } = useFormatters();
  const {
    metricsQuery,
    pendingQuery,
    loadingId,
    selectedCourier,
    isCourierApprovalModalOpen,
    closeCourierApproval,
    printCourierContract,
    approveBrand,
    rejectBrand,
    approveCategory,
    rejectCategory,
    approveCourier,
    rejectCourier,
  } = useDashboardOverview();

  const metrics = metricsQuery.data;

  if (metricsQuery.isLoading) {
    return <DashboardLoading />;
  }

  if (metricsQuery.isError) {
    return <DashboardError onRetry={() => metricsQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard')}
        description={t('dashboard_subtitle')}
      >
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
          <span className="h-2 w-2 rounded-full bg-primary" />
          {metricsQuery.isFetching ? t('refreshing') : t('live')}
        </div>
      </PageHeader>

      <DashboardStatsGrid metrics={metrics} formatNumber={formatNumber} />
      <DashboardCharts metrics={metrics} />

      <OrderStatusSummary
        items={[
          { label: t('pending'), value: formatNumber(metrics?.orders[OrderStatus.Pending]), icon: <Clock className="h-4 w-4" />, color: 'text-amber-600 bg-amber-50' },
          { label: t('processing'), value: formatNumber(metrics?.orders[OrderStatus.Processing]), icon: <Loader2 className="h-4 w-4" />, color: 'text-blue-600 bg-blue-50' },
          { label: t('delivered'), value: formatNumber(metrics?.orders[OrderStatus.Delivered]), icon: <CheckCircle className="h-4 w-4" />, color: 'text-emerald-600 bg-emerald-50' },
          { label: t('cancelled'), value: formatNumber(metrics?.orders[OrderStatus.Cancelled]), icon: <XCircle className="h-4 w-4" />, color: 'text-red-500 bg-red-50' },
        ]}
      />

      <PendingApprovalsSection
        pending={pendingQuery.data}
        isLoading={pendingQuery.isLoading}
        loadingId={loadingId}
        onApproveBrand={approveBrand}
        onRejectBrand={rejectBrand}
        onApproveCategory={approveCategory}
        onRejectCategory={rejectCategory}
        onApproveCourier={approveCourier}
        onRejectCourier={rejectCourier}
      />

      <CourierApprovalModal
        courier={selectedCourier}
        isOpen={isCourierApprovalModalOpen}
        onClose={closeCourierApproval}
        onPrint={printCourierContract}
      />
    </div>
  );
};
