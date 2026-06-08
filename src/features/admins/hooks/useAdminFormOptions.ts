import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchDeliveryZones } from '@/services/deliveryZoneService';
import { fetchRoles } from '@/services/roleService';
import { getNextCursorOrPageParam } from '@/utils/pagination';

export const useAdminFormOptions = () => {
  const [rolesSearchTerm, setRolesSearchTerm] = useState('');
  const [zonesSearchTerm, setZonesSearchTerm] = useState('');
  const debouncedRolesSearch = useDebounce(rolesSearchTerm, 400);
  const debouncedZonesSearch = useDebounce(zonesSearchTerm, 400);

  const rolesQuery = useInfiniteQuery({
    queryKey: ['admin-form', 'roles', debouncedRolesSearch],
    queryFn: ({ pageParam = null }) =>
      fetchRoles({ search: debouncedRolesSearch, cursor: pageParam ? String(pageParam) : null }),
    getNextPageParam: getNextCursorOrPageParam,
    initialPageParam: null as string | null,
    placeholderData: (previousData) => previousData,
  });

  const zonesQuery = useInfiniteQuery({
    queryKey: ['admin-form', 'delivery-zones', debouncedZonesSearch],
    queryFn: ({ pageParam = null }) =>
      fetchDeliveryZones({
        search: debouncedZonesSearch,
        cursor: pageParam ? String(pageParam) : null,
        is_active: '1',
      }),
    getNextPageParam: getNextCursorOrPageParam,
    initialPageParam: null as string | null,
    placeholderData: (previousData) => previousData,
  });

  return {
    roles: rolesQuery.data?.pages.flatMap((page) => page.data) ?? [],
    rolesSearchTerm,
    setRolesSearchTerm,
    rolesLoading: rolesQuery.isLoading,
    rolesFetching: rolesQuery.isFetching,
    rolesFetchingNextPage: rolesQuery.isFetchingNextPage,
    rolesHasNextPage: rolesQuery.hasNextPage,
    loadMoreRoles: rolesQuery.fetchNextPage,
    zones: zonesQuery.data?.pages.flatMap((page) => page.data) ?? [],
    zonesSearchTerm,
    setZonesSearchTerm,
    zonesLoading: zonesQuery.isLoading,
    zonesFetching: zonesQuery.isFetching,
    zonesFetchingNextPage: zonesQuery.isFetchingNextPage,
    zonesHasNextPage: zonesQuery.hasNextPage,
    loadMoreZones: zonesQuery.fetchNextPage,
  };
};
