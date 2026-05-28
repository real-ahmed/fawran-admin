import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils';

interface DateFilterInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const formatFilterDate = (value: string, language: string) => {
  if (!value) return '';

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(language.startsWith('ar') ? 'ar-EG' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const parseInputDate = (value: string) => {
  if (!value) return new Date();

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const buildCalendarDays = (viewDate: Date, weekStartsOn: number) => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = (firstDay.getDay() - weekStartsOn + 7) % 7;

  return [
    ...Array.from({ length: leadingDays }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
  ];
};

export const DateFilterInput = ({ label, value, onChange, className }: DateFilterInputProps) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseInputDate(value));
  const containerRef = useRef<HTMLDivElement>(null);
  const locale = i18n.language.startsWith('ar') ? 'ar-EG' : 'en-US';
  const weekStartsOn = i18n.language.startsWith('ar') ? 6 : 0;
  const formattedValue = formatFilterDate(value, i18n.language);
  const selectedDate = value ? parseInputDate(value) : null;

  useEffect(() => {
    if (value) {
      setViewDate(parseInputDate(value));
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const calendarDays = useMemo(() => buildCalendarDays(viewDate, weekStartsOn), [viewDate, weekStartsOn]);
  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const day = new Date(2024, 0, 7 + weekStartsOn + index);
        return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(day);
      }),
    [locale, weekStartsOn]
  );
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(viewDate);

  const changeMonth = (offset: number) => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    setOpen((current) => !current);
  };

  const handleSelectDate = (date: Date) => {
    onChange(toInputDate(date));
    setOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={containerRef} dir={i18n.dir()}>
      <button
        type="button"
        className="flex h-10 min-w-[168px] cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        aria-label={label}
        aria-expanded={open}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className={cn('min-w-0 flex-1 truncate text-start', !formattedValue && 'text-muted-foreground')}>
          {formattedValue || label}
        </span>
      </button>

      {open && (
        <div className="absolute top-[calc(100%+0.5rem)] z-50 w-[292px] rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => changeMonth(-1)}
              aria-label={t('previous_month')}
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </button>
            <div className="flex-1 text-center text-sm font-semibold">
              {monthLabel}
            </div>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => changeMonth(1)}
              aria-label={t('next_month')}
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
            {weekdayLabels.map((day) => (
              <div key={day} className="flex h-7 items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-8" />;
              }

              const inputDate = toInputDate(date);
              const isSelected = selectedDate ? inputDate === toInputDate(selectedDate) : false;
              const isToday = inputDate === toInputDate(new Date());

              return (
                <button
                  key={inputDate}
                  type="button"
                  className={cn(
                    'flex h-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isToday && 'border border-primary/50 text-primary',
                    isSelected && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                  )}
                  onClick={() => handleSelectDate(date)}
                  aria-pressed={isSelected}
                >
                  {new Intl.NumberFormat(locale).format(date.getDate())}
                </button>
              );
            })}
          </div>

          {value && (
            <button
              type="button"
              className="mt-3 h-8 w-full rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              {t('clear')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
