import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchVendors } from '@/services/vendorService';
import type { VendorType, VendorStatus } from '@/types/vendor';

interface UseVendorsListOptions {
  search?: string;
  type?: string;
  status?: string;
}

export const useVendorsList = (options: UseVendorsListOptions = {}) => {
  return useInfiniteQuery({
    queryKey: ['vendors', options],
    queryFn: async ({ pageParam = 1 }) => {
      return fetchVendors({
        page: pageParam,
        per_page: 15,
        search: options.search,
        type: options.type !== 'all' ? options.type : undefined,
        status: options.status !== 'all' ? options.status : undefined,
      });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta && lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};
