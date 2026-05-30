import { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Filter, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/PageHeader';
import { financeService } from '@/services/financeService';
import { Money } from '@/components/Money';
import { useFormatters } from '@/hooks/useFormatters';
import { ActionMenu } from '@/components/ActionMenu';
import { DataTableSkeletonRows } from '@/components/DataTableSkeletonRows';
import { EmptyState } from '@/components/EmptyState';
import { getNextPageNumberParam } from '@/utils/pagination';
import { PayoutRequestStatus } from '@/types/enums';
import type { PayoutRequestFilterDTO } from '@/types/finance';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export const PayoutRequestsPage = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { formatDateTime } = useFormatters();

  const [filters, setFilters] = useState<PayoutRequestFilterDTO>({
    status: '',
  });

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['payout-requests', filters],
    queryFn: ({ pageParam }) => financeService.getPayoutRequests({ ...filters, cursor: pageParam }),
    initialPageParam: '',
    getNextPageParam: getNextPageNumberParam,
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => financeService.approvePayout(id),
    onSuccess: () => {
      toast.success(t('payout_approved_successfully'));
      queryClient.invalidateQueries({ queryKey: ['payout-requests'] });
      queryClient.invalidateQueries({ queryKey: ['finances-overview'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('error_approving_payout'));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => financeService.rejectPayout(id),
    onSuccess: () => {
      toast.success(t('payout_rejected_successfully'));
      queryClient.invalidateQueries({ queryKey: ['payout-requests'] });
      queryClient.invalidateQueries({ queryKey: ['finances-overview'] });
    },
    onError: () => {
      toast.error(t('error_rejecting_payout'));
    },
  });

  const payouts = data?.pages.flatMap((page) => page.data) ?? [];
  const isEmpty = !isLoading && payouts.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('payout_requests')}
        description={t('payout_requests_description')}
        icon={AlertCircle}
      />

      <div className="rounded-2xl border border-border/40 bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border/40 p-4 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-4">
            <div className="flex w-full items-center gap-2 md:max-w-xs">
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? '' : value as PayoutRequestStatus })}
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 me-2 text-muted-foreground" />
                  <SelectValue placeholder={t('all_statuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_statuses')}</SelectItem>
                  {Object.values(PayoutRequestStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`status_${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-border/40 bg-muted/30 text-muted-foreground">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-medium">{t('id')}</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">{t('user')}</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-end">{t('amount')}</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">{t('bank_details')}</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">{t('date')}</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-center">{t('status')}</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-end">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <DataTableSkeletonRows columns={['w-[80px]', 'w-[200px]', 'w-[120px]', 'w-full', 'w-[150px]', 'w-[100px]', 'w-[80px]']} />
              ) : isEmpty ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8">
                    <EmptyState
                      icon={AlertCircle}
                      title={t('no_payouts_found')}
                      description={t('try_adjusting_filters')}
                    />
                  </td>
                </tr>
              ) : (
                payouts.map((payout) => (
                  <tr key={payout.id} className="transition-colors hover:bg-muted/30">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                      #{payout.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {payout.user?.name || t('unknown')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {payout.user?.email || payout.user?.phone}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-end font-medium">
                      <Money amount={payout.amount} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">
                      {payout.bank_details}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDateTime(payout.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        payout.status === PayoutRequestStatus.Transferred ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' :
                        payout.status === PayoutRequestStatus.Pending ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400' :
                        'bg-destructive/10 text-destructive dark:bg-destructive/20'
                      }`}>
                        {t(`status_${payout.status}`)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-end">
                      <ActionMenu
                        actions={[
                          {
                            label: t('approve'),
                            icon: CheckCircle,
                            onClick: () => {
                              if (window.confirm(t('confirm_approve_payout'))) {
                                approveMutation.mutate(payout.id);
                              }
                            },
                            show: payout.status === PayoutRequestStatus.Pending,
                          },
                          {
                            label: t('reject'),
                            icon: XCircle,
                            onClick: () => {
                              if (window.confirm(t('confirm_reject_payout'))) {
                                rejectMutation.mutate(payout.id);
                              }
                            },
                            show: payout.status === PayoutRequestStatus.Pending,
                            variant: 'destructive',
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {hasNextPage && (
          <div className="flex justify-center border-t border-border/40 p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? t('loading_more') : t('load_more')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
