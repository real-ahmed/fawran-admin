import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { getCouriers } from '@/services/courierService';
import type { CourierApprovalStatus, CouriersQuery } from '@/types/courier';
import { ApprovalStatus, VehicleType } from '@/types/enums';
import { useDebounce } from '@/hooks/useDebounce';
import { getNextCursorOrPageParam } from '@/utils/pagination';

const ALL_FILTER_VALUE = 'all';

type OnlineFilterValue = typeof ALL_FILTER_VALUE | 'online' | 'offline';
type VehicleFilterValue = typeof ALL_FILTER_VALUE | VehicleType;

export interface CourierFilters {
  searchTerm: string;
  vehicleType: VehicleFilterValue;
  onlineStatus: OnlineFilterValue;
}

interface UseCouriersListParams {
  approvalStatus: CourierApprovalStatus;
  initialOnlineStatus?: OnlineFilterValue;
}

const buildCourierFilters = (
  approvalStatus: CourierApprovalStatus,
  debouncedSearch: string,
  filters: Pick<CourierFilters, 'vehicleType' | 'onlineStatus'>
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
});

export const useCouriersList = ({ approvalStatus, initialOnlineStatus = ALL_FILTER_VALUE }: UseCouriersListParams) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleFilterValue>(ALL_FILTER_VALUE);
  const [onlineStatus, setOnlineStatus] = useState<OnlineFilterValue>(initialOnlineStatus);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { ref: loadMoreRef, inView } = useInView();

  const filters = useMemo(
    () => buildCourierFilters(approvalStatus, debouncedSearch, { vehicleType, onlineStatus }),
    [approvalStatus, debouncedSearch, vehicleType, onlineStatus]
  );

  const couriersQuery = useInfiniteQuery({
    queryKey: ['couriers', filters],
    queryFn: async ({ pageParam = null }) => {
      const isCursor = typeof pageParam === 'string';
      return getCouriers({
        ...filters,
        ...(isCursor ? { cursor: pageParam } : { page: pageParam || 1 }),
      });
    },
    getNextPageParam: getNextCursorOrPageParam,
    initialPageParam: null as string | number | null,
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
    },
    setSearchTerm,
    setVehicleType,
    setOnlineStatus,
    clearFilters,
  };
};
