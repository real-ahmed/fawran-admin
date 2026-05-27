import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => (
  <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center shadow-sm">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Icon className="h-6 w-6" />
    </div>
    <h2 className="text-base font-semibold text-foreground">{title}</h2>
    <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    {actionLabel && onAction && (
      <Button type="button" onClick={onAction} className="mt-5">
        {actionLabel}
      </Button>
    )}
  </div>
);
