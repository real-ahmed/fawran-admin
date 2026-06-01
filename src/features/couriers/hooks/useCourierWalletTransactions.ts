import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { getCourierWalletTransactions } from '@/services/courierService';
import { WalletTransaction } from '@/types/finance';
import { getNextCursorOrPageParam } from '@/utils/pagination';

export const useCourierWalletTransactions = (courierId: number) => {
  const { ref: loadMoreRef, inView } = useInView();

  const query = useInfiniteQuery({
    queryKey: ['courier-wallet-transactions', courierId],
    queryFn: async ({ pageParam = null }) => {
      const cursor = typeof pageParam === 'string' ? pageParam : undefined;
      return getCourierWalletTransactions(courierId, cursor);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => getNextCursorOrPageParam(lastPage),
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      flatData: data.pages.flatMap((page) => page.data) as WalletTransaction[],
    }),
    enabled: !!courierId,
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
