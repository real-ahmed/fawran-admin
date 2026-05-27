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
import { CourierDeliveryZone, CourierVehicleType } from '@/types/courier';
import { getLocalizedDisplayName } from '@/utils/displayName';

interface CouriersToolbarProps {
  searchTerm: string;
  vehicleType: string;
  onlineStatus: string;
  deliveryZoneId: string;
  deliveryZones: CourierDeliveryZone[];
  isLoadingDeliveryZones: boolean;
  onSearchChange: (value: string) => void;
  onVehicleTypeChange: (value: string) => void;
  onOnlineStatusChange: (value: string) => void;
  onDeliveryZoneChange: (value: string) => void;
  onClearFilters: () => void;
}

export const CouriersToolbar = ({
  searchTerm,
  vehicleType,
  onlineStatus,
  deliveryZoneId,
  deliveryZones,
  isLoadingDeliveryZones,
  onSearchChange,
  onVehicleTypeChange,
  onOnlineStatusChange,
  onDeliveryZoneChange,
  onClearFilters,
}: CouriersToolbarProps) => {
  const { t, i18n } = useTranslation();
  const hasActiveFilters =
    searchTerm !== '' ||
    vehicleType !== 'all' ||
    onlineStatus !== 'all' ||
    deliveryZoneId !== 'all';

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(160px,220px))_auto] md:items-center">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="ps-9"
            placeholder={t('search_couriers')}
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <Select value={vehicleType} onValueChange={onVehicleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('vehicle_type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_vehicle_types')}</SelectItem>
            <SelectItem value={CourierVehicleType.MOTORCYCLE}>{t('vehicle_motorcycle')}</SelectItem>
            <SelectItem value={CourierVehicleType.BICYCLE}>{t('vehicle_bicycle')}</SelectItem>
            <SelectItem value={CourierVehicleType.CAR}>{t('vehicle_car')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={onlineStatus} onValueChange={onOnlineStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('online_status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_online_statuses')}</SelectItem>
            <SelectItem value="online">{t('online')}</SelectItem>
            <SelectItem value="offline">{t('offline')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={deliveryZoneId} onValueChange={onDeliveryZoneChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('delivery_zone')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_delivery_zones')}</SelectItem>
            {isLoadingDeliveryZones ? (
              <SelectItem value="loading" disabled>{t('loading')}</SelectItem>
            ) : (
              deliveryZones.map((zone) => (
                <SelectItem key={zone.id} value={String(zone.id)}>
                  {getLocalizedDisplayName(zone, i18n.language)}
                </SelectItem>
              ))
            )}
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
