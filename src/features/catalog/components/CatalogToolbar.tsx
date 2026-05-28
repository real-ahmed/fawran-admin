import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ActiveFilter } from '@/types/catalog';

interface CatalogToolbarProps {
  searchTerm: string;
  activeFilter: ActiveFilter;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  onActiveChange: (value: ActiveFilter) => void;
  onClearFilters: () => void;
}

export const CatalogToolbar = ({
  searchTerm,
  activeFilter,
  searchPlaceholder,
  onSearchChange,
  onActiveChange,
  onClearFilters,
}: CatalogToolbarProps) => {
  const { t } = useTranslation();
  const hasActiveFilters = searchTerm !== '' || activeFilter !== 'all';

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_minmax(160px,220px)_auto] md:items-center">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="ps-9"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <Select value={activeFilter} onValueChange={(value) => onActiveChange(value as ActiveFilter)}>
          <SelectTrigger>
            <SelectValue placeholder={t('active_status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_active_statuses')}</SelectItem>
            <SelectItem value="active">{t('active')}</SelectItem>
            <SelectItem value="inactive">{t('inactive')}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          className="gap-2 md:w-auto"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
        >
          {hasActiveFilters ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
          {t('clear')}
        </Button>
      </div>
    </div>
  );
};
