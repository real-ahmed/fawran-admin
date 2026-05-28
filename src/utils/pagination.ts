type PaginationMeta = {
  current_page?: number | string;
  last_page?: number | string;
  next_cursor?: string | null;
};

type PaginationLinks = {
  next?: string | null;
};

type PaginatedLike = {
  meta?: PaginationMeta;
  links?: PaginationLinks;
};

const parsePositivePage = (value: unknown): number | undefined => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : undefined;
};

const pageFromNextLink = (nextLink?: string | null): number | undefined => {
  if (!nextLink) return undefined;

  try {
    const url = new URL(nextLink, 'http://localhost');
    return parsePositivePage(url.searchParams.get('page'));
  } catch {
    return undefined;
  }
};

export const getNextPageNumberParam = (lastPage: PaginatedLike): number | undefined => {
  const currentPage = parsePositivePage(lastPage.meta?.current_page);
  const lastPageNumber = parsePositivePage(lastPage.meta?.last_page);

  if (currentPage !== undefined && lastPageNumber !== undefined && currentPage < lastPageNumber) {
    return currentPage + 1;
  }

  return pageFromNextLink(lastPage.links?.next);
};

export const getNextCursorOrPageParam = (lastPage: PaginatedLike): number | string | undefined => {
  if (lastPage.meta?.next_cursor) {
    return lastPage.meta.next_cursor;
  }

  return getNextPageNumberParam(lastPage);
};
