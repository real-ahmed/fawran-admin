import { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Wallet, Search, Filter, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { PageHeader } from '@/components/PageHeader';
import { financeService } from '@/services/financeService';
import { Money } from '@/components/Money';
import { ActionMenu } from '@/components/ActionMenu';
import { DataTableSkeletonRows } from '@/components/DataTableSkeletonRows';
import { EmptyState } from '@/components/EmptyState';
import { getNextPageNumberParam } from '@/utils/pagination';
import { SettlementStatus, SettlementType, ExecutionMethod } from '@/types/enums';
import type { Settlement, SettlementFilterDTO } from '@/types/finance';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const SettlementsPage = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<SettlementFilterDTO>({
    status: '',
    settlement_type: '',
  });

  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [executionMethod, setExecutionMethod] = useState<ExecutionMethod | ''>('');
  const [executionNotes, setExecutionNotes] = useState('');

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['settlements', filters],
    queryFn: ({ pageParam }) => financeService.getSettlements({ ...filters, cursor: pageParam }),
    initialPageParam: '',
    getNextPageParam: getNextPageNumberParam,
  });

  const executeMutation = useMutation({
    mutationFn: (settlementId: number) =>
      financeService.executeSettlement(settlementId, {
        execution_method: executionMethod as ExecutionMethod,
        notes: executionNotes,
      }),
    onSuccess: () => {
      toast.success(t('settlement_executed_successfully'));
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
      queryClient.invalidateQueries({ queryKey: ['finances-overview'] });
      setSelectedSettlement(null);
      setExecutionMethod('');
      setExecutionNotes('');
    },
    onError: () => {
      toast.error(t('error_executing_settlement'));
    },
  });

  const settlements = data?.pages.flatMap((page) => page.data) ?? [];
  const isEmpty = !isLoading && settlements.length === 0;

  const handleExecuteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSettlement || !executionMethod) return;
    executeMutation.mutate(selectedSettlement.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('settlements')}
        description={t('settlements_description')}
        icon={Wallet}
      />

      <div className="rounded-2xl border border-border/40 bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border/40 p-4 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-4">
            <div className="flex w-full items-center gap-2 md:max-w-xs">
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? '' : value as SettlementStatus })}
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 me-2 text-muted-foreground" />
                  <SelectValue placeholder={t('all_statuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_statuses')}</SelectItem>
                  {Object.values(SettlementStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`status_${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex w-full items-center gap-2 md:max-w-xs">
              <Select
                value={filters.settlement_type || 'all'}
                onValueChange={(value) => setFilters({ ...filters, settlement_type: value === 'all' ? '' : value as SettlementType })}
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 me-2 text-muted-foreground" />
                  <SelectValue placeholder={t('all_types')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_types')}</SelectItem>
                  {Object.values(SettlementType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`type_${type}`)}
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
                <th className="whitespace-nowrap px-4 py-3 font-medium">{t('type')}</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">{t('target')}</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">{t('period')}</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-end">{t('net_exchange')}</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-center">{t('status')}</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-end">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <DataTableSkeletonRows columns={['w-[80px]', 'w-[120px]', 'w-[200px]', 'w-[150px]', 'w-[120px]', 'w-[100px]', 'w-[80px]']} />
              ) : isEmpty ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8">
                    <EmptyState
                      icon={Wallet}
                      title={t('no_settlements_found')}
                      description={t('try_adjusting_filters')}
                    />
                  </td>
                </tr>
              ) : (
                settlements.map((settlement) => (
                  <tr key={settlement.id} className="transition-colors hover:bg-muted/30">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                      #{settlement.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {t(`type_${settlement.settlement_type}`)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {settlement.target_entity?.name || t('unknown')}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {format(new Date(settlement.period_start), 'MMM d')} - {format(new Date(settlement.period_end), 'MMM d, yyyy')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-end font-medium">
                      <Money amount={settlement.total_net_exchange} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        settlement.status === SettlementStatus.Completed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' :
                        settlement.status === SettlementStatus.Pending ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-400'
                      }`}>
                        {t(`status_${settlement.status}`)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-end">
                      <ActionMenu
                        actions={[
                          {
                            label: t('execute_settlement'),
                            icon: CheckCircle,
                            onClick: () => setSelectedSettlement(settlement),
                            show: settlement.status === SettlementStatus.Pending,
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

      <Dialog open={!!selectedSettlement} onOpenChange={(open) => !open && setSelectedSettlement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('execute_settlement')} #{selectedSettlement?.id}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleExecuteSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{t('execution_method')}</Label>
              <Select
                value={executionMethod}
                onValueChange={(val) => setExecutionMethod(val as ExecutionMethod)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('select_method')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ExecutionMethod.Cash}>{t('method_cash')}</SelectItem>
                  <SelectItem value={ExecutionMethod.Wallet}>{t('method_wallet')}</SelectItem>
                  <SelectItem value={ExecutionMethod.Bank}>{t('method_bank')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>{t('notes')} ({t('optional')})</Label>
              <Textarea 
                value={executionNotes}
                onChange={(e) => setExecutionNotes(e.target.value)}
                placeholder={t('execution_notes_placeholder')}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSelectedSettlement(null)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={!executionMethod || executeMutation.isPending}>
                {executeMutation.isPending ? t('executing') : t('confirm_execution')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
