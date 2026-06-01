import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { getVendorWalletTransactions } from '@/services/vendorService';
import { WalletTransaction } from '@/types/finance';
import { getNextCursorOrPageParam } from '@/utils/pagination';

export const useVendorWalletTransactions = (vendorId: number) => {
  const { ref: loadMoreRef, inView } = useInView();

  const query = useInfiniteQuery({
    queryKey: ['vendor-wallet-transactions', vendorId],
    queryFn: async ({ pageParam = null }) => {
      const cursor = typeof pageParam === 'string' ? pageParam : undefined;
      return getVendorWalletTransactions(vendorId, cursor);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => getNextCursorOrPageParam(lastPage),
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      flatData: data.pages.flatMap((page) => page.data) as WalletTransaction[],
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
    transactions: query.data?.flatData || [],
    loadMoreRef,
  };
};
