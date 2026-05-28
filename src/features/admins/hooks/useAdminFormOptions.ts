import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchDeliveryZones } from '@/services/deliveryZoneService';
import { fetchRoles } from '@/services/roleService';
import { getNextPageNumberParam } from '@/utils/pagination';

export const useAdminFormOptions = () => {
  const [rolesSearchTerm, setRolesSearchTerm] = useState('');
  const [zonesSearchTerm, setZonesSearchTerm] = useState('');
  const debouncedRolesSearch = useDebounce(rolesSearchTerm, 400);
  const debouncedZonesSearch = useDebounce(zonesSearchTerm, 400);

  const rolesQuery = useInfiniteQuery({
    queryKey: ['admin-form', 'roles', debouncedRolesSearch],
    queryFn: ({ pageParam = 1 }) => fetchRoles({ search: debouncedRolesSearch, page: pageParam }),
    getNextPageParam: getNextPageNumberParam,
    initialPageParam: 1,
    placeholderData: (previousData) => previousData,
  });

  const zonesQuery = useInfiniteQuery({
    queryKey: ['admin-form', 'delivery-zones', debouncedZonesSearch],
    queryFn: ({ pageParam = 1 }) =>
      fetchDeliveryZones({
        search: debouncedZonesSearch,
        page: pageParam,
        is_active: '1',
      }),
    getNextPageParam: getNextPageNumberParam,
    initialPageParam: 1,
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
