import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { getCouriers } from '@/services/courierService';
import { fetchDeliveryZones } from '@/services/deliveryZoneService';
import { CourierVehicleType, CouriersQuery } from '@/types/courier';
import { useDebounce } from '@/hooks/useDebounce';

const ALL_FILTER_VALUE = 'all';

type OnlineFilterValue = typeof ALL_FILTER_VALUE | 'online' | 'offline';
type VehicleFilterValue = typeof ALL_FILTER_VALUE | CourierVehicleType;
type DeliveryZoneFilterValue = typeof ALL_FILTER_VALUE | string;

export interface CourierFilters {
  searchTerm: string;
  vehicleType: VehicleFilterValue;
  onlineStatus: OnlineFilterValue;
  deliveryZoneId: DeliveryZoneFilterValue;
}

interface UseCouriersListParams {
  approvalStatus: 'pending' | 'approved';
}

const buildCourierFilters = (
  approvalStatus: 'pending' | 'approved',
  debouncedSearch: string,
  filters: Pick<CourierFilters, 'vehicleType' | 'onlineStatus' | 'deliveryZoneId'>
): CouriersQuery => ({
  approval_status: approvalStatus,
  search: debouncedSearch,
  vehicle_type: filters.vehicleType === ALL_FILTER_VALUE ? undefined : filters.vehicleType,
  is_online:
    filters.onlineStatus === ALL_FILTER_VALUE
      ? undefined
      : filters.onlineStatus === 'online'
        ? 1
        : 0,
  delivery_zone_id:
    filters.deliveryZoneId === ALL_FILTER_VALUE
      ? undefined
      : Number(filters.deliveryZoneId),
});

export const useCouriersList = ({ approvalStatus }: UseCouriersListParams) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleFilterValue>(ALL_FILTER_VALUE);
  const [onlineStatus, setOnlineStatus] = useState<OnlineFilterValue>(ALL_FILTER_VALUE);
  const [deliveryZoneId, setDeliveryZoneId] = useState<DeliveryZoneFilterValue>(ALL_FILTER_VALUE);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { ref: loadMoreRef, inView } = useInView();

  const filters = useMemo(
    () => buildCourierFilters(approvalStatus, debouncedSearch, { vehicleType, onlineStatus, deliveryZoneId }),
    [approvalStatus, debouncedSearch, vehicleType, onlineStatus, deliveryZoneId]
  );

  const couriersQuery = useInfiniteQuery({
    queryKey: ['couriers', filters],
    queryFn: async ({ pageParam = 1 }) => {
      return getCouriers({ ...filters, page: pageParam });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    refetchInterval: approvalStatus === 'pending' ? 10000 : false, // Poll every 10 seconds for new requests
  });

  const deliveryZonesQuery = useQuery({
    queryKey: ['delivery-zones', 'courier-filter'],
    queryFn: () => fetchDeliveryZones({ is_active: 1, per_page: 100 }),
  });

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = couriersQuery;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

  const clearFilters = () => {
    setSearchTerm('');
    setVehicleType(ALL_FILTER_VALUE);
    setOnlineStatus(ALL_FILTER_VALUE);
    setDeliveryZoneId(ALL_FILTER_VALUE);
  };

  return {
    couriers: couriersQuery.data?.pages.flatMap(page => page.data) || [],
    isLoading: couriersQuery.isLoading,
    isError: couriersQuery.isError,
    hasNextPage: couriersQuery.hasNextPage,
    isFetchingNextPage: couriersQuery.isFetchingNextPage,
    loadMoreRef,
    filters: {
      searchTerm,
      vehicleType,
      onlineStatus,
      deliveryZoneId,
    },
    setSearchTerm,
    setVehicleType,
    setOnlineStatus,
    setDeliveryZoneId,
    clearFilters,
    deliveryZones: deliveryZonesQuery.data?.data || [],
    isLoadingDeliveryZones: deliveryZonesQuery.isLoading,
  };
};
