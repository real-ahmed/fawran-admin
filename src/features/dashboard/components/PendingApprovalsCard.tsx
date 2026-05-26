import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PendingItem {
  id: number;
  name: string;
}

interface PendingApprovalsCardProps {
  title: string;
  items: PendingItem[];
  icon: ReactNode;
}

export const PendingApprovalsCard = ({ title, items, icon }: PendingApprovalsCardProps) => {
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
              <span className="truncate">{item.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
