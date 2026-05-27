import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils';

interface TableActionButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'destructive';
}

export const TableActionButton = ({
  label,
  icon: Icon,
  onClick,
  disabled,
  tone = 'default',
}: TableActionButtonProps) => (
  <Button
    variant="ghost"
    size="icon"
    title={label}
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      tone === 'destructive' && 'text-destructive hover:bg-destructive/10 hover:text-destructive'
    )}
  >
    <Icon className="h-4 w-4" />
  </Button>
);
