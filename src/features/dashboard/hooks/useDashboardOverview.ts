import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { fetchDashboardMetrics, fetchPendingApprovals } from '@/services/dashboardService';
import { approveBrand, rejectBrand } from '@/services/catalog/brandService';
import { approveCategory, rejectCategory } from '@/services/catalog/categoryService';
import { getCourier, rejectCourier } from '@/services/courierService';
import type { Courier } from '@/types/courier';
import { useCourierContractPrinter } from '@/features/couriers/hooks/useCourierContractPrinter';
import { parseApiError } from '@/utils/api';

interface DashboardApprovalAction {
  id: number;
  action: (id: number) => Promise<void>;
  successMessage: string;
}

export const useDashboardOverview = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null);
  const [isCourierApprovalModalOpen, setIsCourierApprovalModalOpen] = useState(false);

  const metricsQuery = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    refetchInterval: 60_000,
  });

  const pendingQuery = useQuery({
    queryKey: ['dashboard-pending'],
    queryFn: fetchPendingApprovals,
    refetchInterval: 60_000,
  });

  const invalidateDashboard = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-pending'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
  }, [queryClient]);

  const approvalMutation = useMutation({
    mutationFn: async ({ id, action }: DashboardApprovalAction) => action(id),
    onSuccess: (_result, variables) => {
      toast.success(variables.successMessage);
      invalidateDashboard();
    },
    onError: (error) => {
      toast.error(parseApiError(error, t('action_failed')));
    },
    onSettled: () => {
      setLoadingId(null);
    },
  });

  const runApprovalAction = useCallback((
    action: (id: number) => Promise<void>,
    id: number,
    successMessage: string
  ) => {
    setLoadingId(id);
    approvalMutation.mutate({ id, action, successMessage });
  }, [approvalMutation]);

  const openCourierApproval = useCallback(async (id: number) => {
    try {
      setLoadingId(id);
      const courierData = await getCourier(id);
      setSelectedCourier(courierData);
      setIsCourierApprovalModalOpen(true);
    } catch (error) {
      toast.error(t('error_loading_details'));
    } finally {
      setLoadingId(null);
    }
  }, [t]);

  const closeCourierApproval = useCallback(() => {
    setIsCourierApprovalModalOpen(false);
    pendingQuery.refetch();
    metricsQuery.refetch();
  }, [metricsQuery, pendingQuery]);

  const { printCourierContract } = useCourierContractPrinter({
    onPrinted: async (courierId) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-pending'] });
      queryClient.invalidateQueries({ queryKey: ['couriers'] });

      if (selectedCourier?.id === courierId) {
        const refreshedCourier = await getCourier(courierId);
        setSelectedCourier(refreshedCourier);
      }
    },
  });

  return {
    metricsQuery,
    pendingQuery,
    loadingId,
    selectedCourier,
    isCourierApprovalModalOpen,
    closeCourierApproval,
    printCourierContract,
    approveBrand: (id: number) => runApprovalAction(approveBrand, id, t('brand_approved')),
    rejectBrand: (id: number) => runApprovalAction(rejectBrand, id, t('brand_rejected')),
    approveCategory: (id: number) => runApprovalAction(approveCategory, id, t('category_approved')),
    rejectCategory: (id: number) => runApprovalAction(rejectCategory, id, t('category_rejected')),
    approveCourier: openCourierApproval,
    rejectCourier: (id: number) => runApprovalAction(rejectCourier, id, t('courier_rejected')),
  };
};
