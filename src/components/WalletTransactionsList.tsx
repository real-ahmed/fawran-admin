import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Money } from '@/components/Money';
import { Badge } from '@/components/ui/badge';
import { WalletTransaction } from '@/types/finance';
import { Loader2, ArrowUpRight, ArrowDownLeft, Receipt } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';

interface WalletTransactionsListProps {
  transactions: WalletTransaction[];
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  loadMoreRef: (node?: Element | null | undefined) => void;
}

export const WalletTransactionsList = ({
  transactions,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  loadMoreRef,
}: WalletTransactionsListProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>{t('date')}</TableHead>
            <TableHead>{t('type')}</TableHead>
            <TableHead>{t('amount')}</TableHead>
            <TableHead>{t('reference')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
              </TableRow>
            ))
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-destructive">
                {t('error_loading_transactions')}
              </TableCell>
            </TableRow>
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32">
                <EmptyState icon={Receipt} title={t('no_transactions_found')} description={t('no_transactions_found_desc')} />
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-medium">#{tx.id}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(tx.created_at), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {['deposit', 'refund', 'delivery_earning', 'commission_earning'].includes(tx.type) ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-red-500" />
                    )}
                    <span>{t(`transaction_type_${tx.type}`)}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <Money amount={tx.amount} className={['deposit', 'refund', 'delivery_earning', 'commission_earning'].includes(tx.type) ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'} />
                </TableCell>
                <TableCell>
                  {tx.reference_type ? (
                    <Badge variant="outline" className="text-xs">
                      {tx.reference_type} #{tx.reference_id}
                    </Badge>
                  ) : '-'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex min-h-12 items-center justify-center border-t p-4 text-muted-foreground">
          {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        </div>
      )}
    </div>
  );
};
