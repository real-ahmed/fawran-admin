import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OrderType } from '@/types/enums';
import { DateFilterInput } from './DateFilterInput';
import { SearchableSelect } from '@/components/SearchableSelect';

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
  const orderTypeOptions = [
    { value: 'all', label: t('all_types') },
    { value: OrderType.Delivery, label: t('order_type_delivery') },
    { value: OrderType.Pickup, label: t('order_type_pickup') },
    { value: OrderType.InStore, label: t('order_type_in_store') },
  ];

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

        <SearchableSelect
          value={orderType}
          options={orderTypeOptions}
          onChange={(value) => onOrderTypeChange(value as OrderType | 'all')}
          placeholder={t('order_type')}
          className="w-[180px]"
        />

        <DateFilterInput label={t('date_from')} value={dateFrom} onChange={onDateFromChange} />
        <DateFilterInput label={t('date_to')} value={dateTo} onChange={onDateToChange} />

        <Button type="button" variant="outline" className="gap-2" onClick={onClearFilters} disabled={!hasActiveFilters}>
          {hasActiveFilters ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
          {t('clear')}
        </Button>
      </div>
    </div>
  );
};
