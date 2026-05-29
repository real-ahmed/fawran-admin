import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ActiveFilter } from '@/types/catalog';
import { SearchableSelect } from '@/components/SearchableSelect';

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
  const activeFilterOptions = [
    { value: 'all', label: t('all_active_statuses') },
    { value: 'active', label: t('active') },
    { value: 'inactive', label: t('inactive') },
  ];

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

        <SearchableSelect
          value={activeFilter}
          options={activeFilterOptions}
          onChange={(value) => onActiveChange(value as ActiveFilter)}
          placeholder={t('active_status')}
        />

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
