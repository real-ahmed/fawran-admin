import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { VendorType } from '@/types/vendor';
import type { VendorTypeFilter } from '../hooks/useVendorsList';
import { SearchableSelect } from '@/components/SearchableSelect';

const ALL_FILTER_VALUE = 'all';

interface VendorsToolbarProps {
  searchTerm: string;
  typeFilter: VendorTypeFilter;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: VendorTypeFilter) => void;
}

export const VendorsToolbar = ({
  searchTerm,
  typeFilter,
  onSearchChange,
  onTypeChange,
}: VendorsToolbarProps) => {
  const { t } = useTranslation();
  const typeOptions = [
    { value: ALL_FILTER_VALUE, label: t('all_types') },
    ...Object.values(VendorType).map((type) => ({
      value: type,
      label: t(`vendor_type_${type}`),
    })),
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="ps-9"
            placeholder={t('search_vendors')}
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <SearchableSelect
          value={typeFilter}
          options={typeOptions}
          onChange={(value) => onTypeChange(value as VendorTypeFilter)}
          placeholder={t('all_types')}
          className="w-full sm:w-48"
        />
      </div>
    </div>
  );
};
