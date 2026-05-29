import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { fetchVendorOwners } from '@/services/vendorOwnerService';
import { getNextPageNumberParam } from '@/utils/pagination';

export const useVendorOwnerSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { ref: loadMoreRef, inView } = useInView();

  const query = useInfiniteQuery({
    queryKey: ['vendorOwners', searchTerm],
    queryFn: ({ pageParam = 1 }) => fetchVendorOwners({ search: searchTerm, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: getNextPageNumberParam,
  });

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

  return {
    searchTerm,
    setSearchTerm,
    owners: query.data?.pages.flatMap((page) => page.data) || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage,
    hasNextPage,
    loadMoreRef,
  };
};
