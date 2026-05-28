import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderType } from '@/types/enums';

interface OrdersToolbarProps {
  searchTerm: string;
  orderType: OrderType | 'all';
  dateFrom: string;
  dateTo: string;
  onSearchChange: (val: string) => void;
  onOrderTypeChange: (val: OrderType | 'all') => void;
  onDateFromChange: (val: string) => void;
  onDateToChange: (val: string) => void;
  onClearFilters: () => void;
}

export const OrdersToolbar = ({
  searchTerm, orderType, dateFrom, dateTo,
  onSearchChange, onOrderTypeChange, onDateFromChange, onDateToChange, onClearFilters
}: OrdersToolbarProps) => {
  const { t } = useTranslation();
  const hasActiveFilters = searchTerm !== '' || orderType !== 'all' || dateFrom !== '' || dateTo !== '';

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_auto_auto_auto_auto] md:items-center">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="ps-9"
            placeholder={t('search_orders')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Select value={orderType} onValueChange={(val) => onOrderTypeChange(val as OrderType | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('order_type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_types')}</SelectItem>
            <SelectItem value={OrderType.Delivery}>{t('order_type_delivery')}</SelectItem>
            <SelectItem value={OrderType.Pickup}>{t('order_type_pickup')}</SelectItem>
            <SelectItem value={OrderType.InStore}>{t('order_type_in_store')}</SelectItem>
          </SelectContent>
        </Select>

        <Input type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} placeholder={t('date_from')} className="w-[150px]" />
        <Input type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} placeholder={t('date_to')} className="w-[150px]" />

        <Button type="button" variant="outline" className="gap-2" onClick={onClearFilters} disabled={!hasActiveFilters}>
          {hasActiveFilters ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
          {t('clear')}
        </Button>
      </div>
    </div>
  );
};
