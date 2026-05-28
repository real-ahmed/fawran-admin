import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle, Check, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface PendingItem {
  id: number;
  name: string;
}

interface PendingApprovalsCardProps {
  title: string;
  items: PendingItem[];
  icon: ReactNode;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  loadingId?: number | null;
}

export const PendingApprovalsCard = ({ title, items, icon, onApprove, onReject, loadingId }: PendingApprovalsCardProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="ms-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-muted/40 py-5 text-center">
          <CheckCircle className="mx-auto mb-2 h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">{t('no_pending_items')}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span className="truncate flex-1">{item.name}</span>
              <div className="flex items-center gap-1">
                {onApprove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                    onClick={() => onApprove(item.id)}
                    disabled={loadingId === item.id}
                    title={t('approve')}
                  >
                    {loadingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-4 w-4" />}
                  </Button>
                )}
                {onReject && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => onReject(item.id)}
                    disabled={loadingId === item.id}
                    title={t('reject')}
                  >
                    {loadingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
