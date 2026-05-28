import { useInfiniteQuery } from '@tanstack/react-query';
import { getOrders } from '@/services/ordersService';
import { OrdersQuery, Order } from '@/types/order';
import { getNextCursorOrPageParam } from '@/utils/pagination';

export const useOrdersList = (params: OrdersQuery) => {
  return useInfiniteQuery({
    queryKey: ['orders', params],
    queryFn: async ({ pageParam }) => {
      const queryParams = typeof pageParam === 'number' 
        ? { ...params, page: pageParam } 
        : { ...params, cursor: pageParam };
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
};
