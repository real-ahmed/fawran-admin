import type { ReactNode } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormFieldError } from '@/components/FormFieldError';

interface AdminOptionsSectionProps {
  label: ReactNode;
  searchTerm: string;
  searchPlaceholder: string;
  clearSearchLabel: string;
  onSearchChange: (value: string) => void;
  selectedLabel?: string;
  isEmpty: boolean;
  isFetching: boolean;
  emptyMessage: string;
  loadingMessage: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  loadMoreLabel: string;
  onLoadMore: () => void;
  errorMessage?: string;
  children: ReactNode;
}

export const AdminOptionsSection = ({
  label,
  searchTerm,
  searchPlaceholder,
  clearSearchLabel,
  onSearchChange,
  selectedLabel,
  isEmpty,
  isFetching,
  emptyMessage,
  loadingMessage,
  hasNextPage,
  isFetchingNextPage,
  loadMoreLabel,
  onLoadMore,
  errorMessage,
  children,
}: AdminOptionsSectionProps) => (
  <div className="grid gap-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        {isFetching && !isFetchingNextPage && !isEmpty && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {loadingMessage}
          </span>
        )}
        {selectedLabel && (
          <Badge variant="secondary" className="rounded-md px-2 py-1 font-medium">
            {selectedLabel}
          </Badge>
        )}
      </div>
    </div>

    <div className="relative">
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        className="h-11 bg-muted/40 ps-9 pe-10"
      />
      {searchTerm && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={clearSearchLabel}
          onClick={() => onSearchChange('')}
          className="absolute end-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>

    <div className="grid max-h-72 min-h-24 gap-3 overflow-y-auto rounded-lg border border-border/70 bg-muted/10 p-3 sm:grid-cols-2 lg:grid-cols-3">
      {!isEmpty && children}
      {isEmpty && (
        <div className="col-span-full flex min-h-20 items-center justify-center rounded-md border border-dashed border-border/70 bg-background/60 px-4 py-6 text-center text-sm text-muted-foreground">
          {isFetching ? loadingMessage : emptyMessage}
        </div>
      )}
    </div>

    {hasNextPage && (
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={onLoadMore}
          disabled={isFetchingNextPage}
          className="w-full sm:w-auto"
        >
          {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" />}
          {isFetchingNextPage ? loadingMessage : loadMoreLabel}
        </Button>
      </div>
    )}
    <FormFieldError message={errorMessage} />
  </div>
);
