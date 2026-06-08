export interface PaginatedResponse<T> {
  success?: boolean;
  message?: string | null;
  data: T[];
  errors?: unknown;
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    per_page?: number | string;
    current_page?: number | string;
    from?: number | string | null;
    last_page?: number | string;
    path?: string;
    to?: number | string | null;
    total?: number | string;
    next_cursor?: string | null;
    previous_cursor?: string | null;
  };
}
