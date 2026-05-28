import { useTranslation } from 'react-i18next';
import { OrderStatusLog } from '@/types/order';
import { OrderStatus } from '@/types/enums';
import { CheckCircle2, Clock, Package, Truck, XCircle } from 'lucide-react';
import { formatOrderDate } from '../utils/date';

interface OrderStatusTimelineProps {
  logs: OrderStatusLog[];
  currentStatus: OrderStatus;
  createdAt: string;
}

export const OrderStatusTimeline = ({ logs, currentStatus, createdAt }: OrderStatusTimelineProps) => {
  const { t, i18n } = useTranslation();

  // Combine initial creation with logs
  const timelineEvents = [
    ...logs.map(log => ({
      status: log.to_status,
      date: new Date(log.created_at),
      by: log.changed_by_name
    })),
    {
      status: OrderStatus.Pending,
      date: new Date(createdAt),
      by: t('system')
    }
  ].sort((a, b) => b.date.getTime() - a.date.getTime()); // Newest first

  const getIconForStatus = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending: return <Clock className="h-4 w-4" />;
      case OrderStatus.Processing: return <Package className="h-4 w-4" />;
      case OrderStatus.OutForDelivery: return <Truck className="h-4 w-4" />;
      case OrderStatus.Delivered: return <CheckCircle2 className="h-4 w-4" />;
      case OrderStatus.Cancelled: return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getColorForStatus = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case OrderStatus.Processing: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case OrderStatus.OutForDelivery: return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      case OrderStatus.Delivered: return 'text-green-500 bg-green-500/10 border-green-500/20';
      case OrderStatus.Cancelled: return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="relative border-s border-border/50 ms-3 space-y-6">
      {timelineEvents.map((event, index) => (
        <div key={index} className="relative ps-6">
          <div className={`absolute -start-3.5 flex h-7 w-7 items-center justify-center rounded-full border ${getColorForStatus(event.status)}`}>
            {getIconForStatus(event.status)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{t(`order_status.${event.status}`)}</span>
            <span className="text-xs text-muted-foreground mt-0.5">
              {formatOrderDate(event.date, i18n.language)} • {event.by}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
