import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { OrderStatus, OrderType } from '@/types/enums';
import { useOrdersList } from '../hooks/useOrdersList';
import { OrdersToolbar } from './OrdersToolbar';
import { EmptyState } from '@/components/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PackageSearch, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Money } from '@/components/Money';
import { formatOrderDate } from '../utils/date';

interface OrdersListProps {
  status?: OrderStatus;
  vendorId?: number;
  courierId?: number;
}

export const OrdersList = ({ status, vendorId, courierId }: OrdersListProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [orderType, setOrderType] = useState<OrderType | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    loadMoreRef
  } = useOrdersList({
    search: searchTerm,
    status,
    vendor_id: vendorId,
    courier_id: courierId,
    order_type: orderType === 'all' ? undefined : orderType,
    date_from: dateFrom,
    date_to: dateTo
  });

  const orders = data?.flatData || [];

  const handleClearFilters = () => {
    setSearchTerm('');
    setOrderType('all');
    setDateFrom('');
    setDateTo('');
  };

  const getStatusColor = (s: OrderStatus) => {
    switch (s) {
      case OrderStatus.Pending: return 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20';
      case OrderStatus.Processing: return 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20';
      case OrderStatus.OutForDelivery: return 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20';
      case OrderStatus.Delivered: return 'bg-green-500/10 text-green-600 hover:bg-green-500/20';
      case OrderStatus.Cancelled: return 'bg-red-500/10 text-red-600 hover:bg-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <OrdersToolbar
        searchTerm={searchTerm}
        orderType={orderType}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onSearchChange={setSearchTerm}
        onOrderTypeChange={setOrderType}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onClearFilters={handleClearFilters}
      />

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>{t('customer')}</TableHead>
              <TableHead>{t('type')}</TableHead>
              <TableHead>{t('total')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('date')}</TableHead>
              <TableHead className="text-end">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-6 w-24 bg-muted animate-pulse rounded-full" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-8 w-8 ml-auto bg-muted animate-pulse rounded" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-destructive">
                  {t('error_loading_orders')}
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32">
                  <EmptyState icon={PackageSearch} title={t('no_orders_found')} description={t('no_orders_found_desc')} />
                </TableCell>
              </TableRow>
            ) : (
              orders.map(order => (
                <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/orders/${order.id}`)}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{order.customer?.name || t('unknown')}</TableCell>
                  <TableCell>
                    {t(`order_type_${order.order_type}`)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.payments_count > 0 ? <Money amount={order.payments[0]?.amount ?? 0} /> : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-none ${getStatusColor(order.status)}`}>
                      {t(`order_status.${order.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatOrderDate(order.created_at, i18n.language)}
                  </TableCell>
                  <TableCell className="text-end">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); navigate(`/orders/${order.id}`); }}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">{t('view_details')}</span>
                    </Button>
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
    </div>
  );
};
