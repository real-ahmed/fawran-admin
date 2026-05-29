import { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { getOrders } from '@/services/ordersService';
import { OrdersQuery, Order } from '@/types/order';
import { getNextCursorOrPageParam } from '@/utils/pagination';

export const useOrdersList = (params: OrdersQuery) => {
  const { ref: loadMoreRef, inView } = useInView();
  const query = useInfiniteQuery({
    queryKey: ['orders', params],
    queryFn: async ({ pageParam = null }) => {
      const isCursor = typeof pageParam === 'string';
      const queryParams = { ...params, ...(isCursor ? { cursor: pageParam } : { page: pageParam || 1 }) };
      return getOrders(queryParams as OrdersQuery);
    },
    initialPageParam: null as string | number | null,
    getNextPageParam: (lastPage) => getNextCursorOrPageParam(lastPage),
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      flatData: data.pages.flatMap((page) => page.data) as Order[],
    }),
  });

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

  return {
    ...query,
    loadMoreRef,
  };
};
