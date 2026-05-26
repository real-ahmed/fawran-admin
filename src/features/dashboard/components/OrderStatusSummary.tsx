import type { ReactNode } from 'react';

interface OrderStatusSummaryItem {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
}

interface OrderStatusSummaryProps {
  items: OrderStatusSummaryItem[];
}

export const OrderStatusSummary = ({ items }: OrderStatusSummaryProps) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {items.map(({ label, value, icon, color }) => (
      <div key={label} className="rounded-lg border border-border bg-card p-4 text-center shadow-sm">
        <div className={`mb-2 inline-flex items-center justify-center rounded-full p-2 ${color}`}>
          {icon}
        </div>
        <p className="text-xl font-bold text-foreground">{value ?? 0}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </div>
    ))}
  </div>
);
