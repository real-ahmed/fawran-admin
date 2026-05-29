import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VehicleType } from '@/types/enums';
import { SearchableSelect } from '@/components/SearchableSelect';

const ALL_FILTER_VALUE = 'all';

type VehicleFilterValue = typeof ALL_FILTER_VALUE | VehicleType;
type OnlineFilterValue = typeof ALL_FILTER_VALUE | 'online' | 'offline';

interface CouriersToolbarProps {
  searchTerm: string;
  vehicleType: VehicleFilterValue;
  onlineStatus: OnlineFilterValue;

  onSearchChange: (value: string) => void;
  onVehicleTypeChange: (value: VehicleFilterValue) => void;
  onOnlineStatusChange: (value: OnlineFilterValue) => void;

  onClearFilters: () => void;
}

export const CouriersToolbar = ({
  searchTerm,
  vehicleType,
  onlineStatus,

  onSearchChange,
  onVehicleTypeChange,
  onOnlineStatusChange,

  onClearFilters,
}: CouriersToolbarProps) => {
  const { t } = useTranslation();
  const hasActiveFilters =
    searchTerm !== '' ||
    vehicleType !== ALL_FILTER_VALUE ||
    onlineStatus !== ALL_FILTER_VALUE;
  const vehicleTypeOptions = [
    { value: ALL_FILTER_VALUE, label: t('all_vehicle_types') },
    { value: VehicleType.Motorcycle, label: t('vehicle_motorcycle') },
    { value: VehicleType.Bicycle, label: t('vehicle_bicycle') },
    { value: VehicleType.Car, label: t('vehicle_car') },
  ];
  const onlineStatusOptions = [
    { value: ALL_FILTER_VALUE, label: t('all_online_statuses') },
    { value: 'online', label: t('online') },
    { value: 'offline', label: t('offline') },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_repeat(2,minmax(160px,220px))_auto] md:items-center">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="ps-9"
            placeholder={t('search_couriers')}
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <SearchableSelect
          value={vehicleType}
          options={vehicleTypeOptions}
          onChange={(value) => onVehicleTypeChange(value as VehicleFilterValue)}
          placeholder={t('vehicle_type')}
        />

        <SearchableSelect
          value={onlineStatus}
          options={onlineStatusOptions}
          onChange={(value) => onOnlineStatusChange(value as OnlineFilterValue)}
          placeholder={t('online_status')}
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
