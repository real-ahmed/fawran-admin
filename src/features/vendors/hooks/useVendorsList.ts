import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchVendors } from '@/services/vendorService';
import type { VendorType, VendorStatus } from '@/types/vendor';
import { getNextPageNumberParam } from '@/utils/pagination';

const ALL_FILTER_VALUE = 'all';

interface UseVendorsListOptions {
  search?: string;
  type?: typeof ALL_FILTER_VALUE | VendorType;
  status?: typeof ALL_FILTER_VALUE | VendorStatus;
}

export const useVendorsList = (options: UseVendorsListOptions = {}) => {
  return useInfiniteQuery({
    queryKey: ['vendors', options],
    queryFn: async ({ pageParam = 1 }) => {
      return fetchVendors({
        page: pageParam,
        search: options.search,
        type: options.type !== ALL_FILTER_VALUE ? options.type : undefined,
        status: options.status !== ALL_FILTER_VALUE ? options.status : undefined,
      });
    },
    getNextPageParam: getNextPageNumberParam,
    initialPageParam: 1,
  });
};
