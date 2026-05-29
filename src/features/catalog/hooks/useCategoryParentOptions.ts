import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { getCategories } from '@/services/catalog/categoryService';
import type { Category } from '@/types/catalog';
import { getNextPageNumberParam } from '@/utils/pagination';
import { useDebounce } from '@/hooks/useDebounce';

interface UseCategoryParentOptionsParams {
  enabled: boolean;
  excludedCategoryId?: number;
  fallbackCategories?: Category[];
}

const mergeCategories = (primary: Category[], secondary: Category[]) => {
  const categories = [...primary];
  const existingIds = new Set(primary.map((category) => category.id));

  secondary.forEach((category) => {
    if (!existingIds.has(category.id)) {
      categories.push(category);
      existingIds.add(category.id);
    }
  });

  return categories;
};

export const useCategoryParentOptions = ({
  enabled,
  excludedCategoryId,
  fallbackCategories = [],
}: UseCategoryParentOptionsParams) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { ref: loadMoreRef, inView } = useInView();

  const query = useInfiniteQuery({
    queryKey: ['catalog', 'categories', 'parent-options', debouncedSearchTerm],
    queryFn: ({ pageParam = 1 }) => getCategories({ search: debouncedSearchTerm, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: getNextPageNumberParam,
    enabled,
  });

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

  useEffect(() => {
    if (!enabled) {
      setSearchTerm('');
    }
  }, [enabled]);

  const categories = useMemo(() => {
    const fetchedCategories = query.data?.pages.flatMap((page) => page.data) ?? [];
    return mergeCategories(fetchedCategories, fallbackCategories).filter(
      (category) => category.id !== excludedCategoryId
    );
  }, [excludedCategoryId, fallbackCategories, query.data?.pages]);

  return {
    categories,
    searchTerm,
    setSearchTerm,
    isLoading: query.isLoading,
    isFetchingNextPage,
    hasNextPage,
    loadMoreRef,
  };
};
