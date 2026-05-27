import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchDeliveryZones } from '@/services/deliveryZoneService';
import { fetchRoles } from '@/services/roleService';

const getNextPageParam = (lastPage: { meta: { current_page: number; last_page: number } }) => {
  if (lastPage.meta.current_page < lastPage.meta.last_page) {
    return lastPage.meta.current_page + 1;
  }

  return undefined;
};

export const useAdminFormOptions = () => {
  const [rolesSearchTerm, setRolesSearchTerm] = useState('');
  const [zonesSearchTerm, setZonesSearchTerm] = useState('');
  const debouncedRolesSearch = useDebounce(rolesSearchTerm, 400);
  const debouncedZonesSearch = useDebounce(zonesSearchTerm, 400);

  const rolesQuery = useInfiniteQuery({
    queryKey: ['admin-form', 'roles', debouncedRolesSearch],
    queryFn: ({ pageParam = 1 }) => fetchRoles({ search: debouncedRolesSearch, page: pageParam }),
    getNextPageParam,
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
    getNextPageParam,
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
