import type { ReactNode } from 'react';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormFieldError } from '@/components/FormFieldError';

interface AdminOptionsSectionProps {
  label: ReactNode;
  searchTerm: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
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
  onSearchChange,
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
  <div className="grid gap-4">
    <Label className="text-sm font-medium">{label}</Label>
    <div className="relative max-w-md">
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        className="bg-muted/40 ps-9"
      />
    </div>
    <div className="grid gap-4 rounded-xl border border-border/60 bg-muted/10 p-5 sm:grid-cols-2 lg:grid-cols-3">
      {children}
      {isEmpty && (
        <div className="col-span-full py-2 text-center text-sm text-muted-foreground">
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
        >
          {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" />}
          {isFetchingNextPage ? loadingMessage : loadMoreLabel}
        </Button>
      </div>
    )}
    <FormFieldError message={errorMessage} />
  </div>
);
