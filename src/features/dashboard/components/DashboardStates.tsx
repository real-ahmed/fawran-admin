import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const DashboardLoading = () => (
  <div className="space-y-6">
    <div className="h-16 rounded-lg bg-muted" />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="h-[124px] animate-pulse rounded-lg border border-border bg-card" />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="h-80 animate-pulse rounded-lg border border-border bg-card" />
      <div className="h-80 animate-pulse rounded-lg border border-border bg-card" />
    </div>
  </div>
);

interface DashboardErrorProps {
  onRetry: () => void;
}

export const DashboardError = ({ onRetry }: DashboardErrorProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[360px] items-center justify-center">
      <div className="max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-sm">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-amber-500" />
        <h1 className="text-lg font-semibold text-foreground">{t('dashboard')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('save_failed')}</p>
        <button
          type="button"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          onClick={onRetry}
        >
          <RefreshCw className="h-4 w-4" />
          {t('retry')}
        </button>
      </div>
    </div>
  );
};
