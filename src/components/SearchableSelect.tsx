import { type Ref, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronsUpDown, Loader2, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils';

export interface SearchableSelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  value: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  loadMoreRef?: Ref<HTMLDivElement>;
}

export const SearchableSelect = ({
  value,
  options,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled,
  className,
  triggerClassName,
  searchTerm,
  onSearchChange,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  loadMoreRef,
}: SearchableSelectProps) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const resolvedSearchTerm = searchTerm ?? internalSearchTerm;
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const visibleOptions = useMemo(() => {
    if (onSearchChange || !resolvedSearchTerm.trim()) {
      return options;
    }

    const normalizedSearch = resolvedSearchTerm.trim().toLowerCase();
    return options.filter((option) => {
      return `${option.label} ${option.description ?? ''}`.toLowerCase().includes(normalizedSearch);
    });
  }, [onSearchChange, options, resolvedSearchTerm]);

  const handleSearchChange = (nextSearchTerm: string) => {
    if (onSearchChange) {
      onSearchChange(nextSearchTerm);
      return;
    }

    setInternalSearchTerm(nextSearchTerm);
  };

  const handleSelect = (option: SearchableSelectOption) => {
    if (option.disabled) return;

    onChange(option.value);
    setOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={containerRef} dir={i18n.dir()}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        className={cn(
          'h-10 w-full justify-between bg-background font-normal',
          !selectedOption && 'text-muted-foreground',
          triggerClassName
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="min-w-0 truncate text-start">
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[220px] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-80 zoom-in-95">
          <div className="flex items-center border-b px-3">
            <Search className="me-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder ?? t('search')}
              value={resolvedSearchTerm}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="h-10 border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
            {isLoading && visibleOptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-6 text-center text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('loading')}
              </div>
            ) : visibleOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage ?? t('no_results_found')}
              </div>
            ) : (
              <div className="flex flex-col">
                {visibleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    className={cn(
                      'relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 ps-8 pe-2 text-start text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
                      value === option.value && 'bg-accent/50 text-accent-foreground'
                    )}
                    onClick={() => handleSelect(option)}
                  >
                    <span className="absolute start-2 flex h-3.5 w-3.5 items-center justify-center">
                      {value === option.value && <Check className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      {option.description && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </button>
                ))}

                {hasNextPage && (
                  <div ref={loadMoreRef} className="flex min-h-10 items-center justify-center py-2 text-muted-foreground">
                    {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
