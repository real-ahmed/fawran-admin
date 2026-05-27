import { useInfiniteQuery } from '@tanstack/react-query';
import { getCouriers } from '@/services/courierService';
import { CouriersQuery } from '@/types/courier';

export const useCouriersList = (filters: CouriersQuery) => {
  return useInfiniteQuery({
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
  });
};
