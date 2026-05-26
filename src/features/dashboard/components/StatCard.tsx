import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: ReactNode;
  sub?: ReactNode;
  icon: ReactNode;
  tone: string;
}

export const StatCard = ({ title, value, sub, icon, tone }: StatCardProps) => (
  <div className="group flex min-h-[124px] items-start gap-4 rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
    <div className={`rounded-md p-3 ${tone}`}>{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  </div>
);
