import { useEffect, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { deleteAdmin, fetchAdmins } from '@/services/adminService';
import { parseApiError } from '@/utils/api';
import { getNextCursorOrPageParam } from '@/utils/pagination';

export const useAdminsList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { ref, inView } = useInView();

  const query = useInfiniteQuery({
    queryKey: ['admins', searchTerm],
    queryFn: ({ pageParam = null }) =>
      fetchAdmins({ search: searchTerm, cursor: pageParam ? String(pageParam) : null }),
    getNextPageParam: getNextCursorOrPageParam,
    initialPageParam: null as string | null,
  });

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

  const deleteMutation = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success(t('deleted'));
      setDeletingId(null);
    },
    onError: (error) => {
      toast.error(parseApiError(error, t('delete_failed')));
      setDeletingId(null);
    },
  });

  return {
    admins: query.data?.pages.flatMap((page) => page.data) || [],
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    loadMoreRef: ref,
    searchTerm,
    setSearchTerm,
    deletingId,
    setDeletingId,
    deleteMutation,
  };
};
