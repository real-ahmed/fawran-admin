import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { getVendorItems } from '@/services/vendorService';
import { VendorItem } from '@/types/vendor';
import { getNextCursorOrPageParam } from '@/utils/pagination';

export const useVendorItems = (vendorId: number) => {
  const { ref: loadMoreRef, inView } = useInView();

  const query = useInfiniteQuery({
    queryKey: ['vendor-items', vendorId],
    queryFn: async ({ pageParam = null }) => {
      const cursor = typeof pageParam === 'string' ? pageParam : undefined;
      return getVendorItems(vendorId, cursor);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => getNextCursorOrPageParam(lastPage),
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      flatData: data.pages.flatMap((page) => page.data) as VendorItem[],
    }),
    enabled: !!vendorId,
  });

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

  return {
    ...query,
    items: query.data?.flatData || [],
    loadMoreRef,
  };
};
