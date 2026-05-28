import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, User, Truck, CreditCard } from 'lucide-react';
import { useOrderDetail } from './hooks/useOrderDetail';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrderStatusTimeline } from './components/OrderStatusTimeline';
import { DeliveryTrackingMap } from './components/DeliveryTrackingMap';
import { SubOrderCard } from './components/SubOrderCard';
import { OrderActionButtons } from './components/OrderActionButtons';
import { OrderStatus } from '@/types/enums';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatOrderDate } from './utils/date';

export const OrderDetailPage = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, isError } = useOrderDetail(Number(id));

  if (isLoading) {
    return <div className="p-8 text-center">{t('loading')}</div>;
  }

  if (isError || !order) {
    return <div className="p-8 text-center text-destructive">{t('error_loading_order')}</div>;
  }

  const getStatusColor = (s: OrderStatus) => {
    switch (s) {
      case OrderStatus.Pending: return 'bg-amber-500/10 text-amber-600';
      case OrderStatus.Processing: return 'bg-blue-500/10 text-blue-600';
      case OrderStatus.OutForDelivery: return 'bg-indigo-500/10 text-indigo-600';
      case OrderStatus.Delivered: return 'bg-green-500/10 text-green-600';
      case OrderStatus.Cancelled: return 'bg-red-500/10 text-red-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              {t('order')} #{order.id}
              <Badge variant="outline" className={`border-none ${getStatusColor(order.status)}`}>
                {t(`order_status.${order.status}`)}
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {formatOrderDate(order.created_at, i18n.language, 'long')} • {t(`order_type_${order.order_type}`)}
            </p>
          </div>
        </div>
        <OrderActionButtons order={order} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sub-Orders Accordion */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('order_items')}</h3>
            {order.sub_orders.map(subOrder => (
              <SubOrderCard key={subOrder.id} subOrder={subOrder} />
            ))}
          </div>

          {/* Delivery & Map */}
          {order.delivery_info?.address && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {t('delivery_tracking')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-[300px] w-full rounded-lg overflow-hidden border">
                  <DeliveryTrackingMap order={order} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('delivery_fee')}: </span>
                    <span className="font-medium">{order.delivery_info.total_delivery_fee} L.E</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('delivery_zone')}: </span>
                    <span className="font-medium">{order.delivery_info.delivery_zone || '—'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Side Info */}
        <div className="space-y-6">
          {/* Customer Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {t('customer_details')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium">{order.customer?.name || t('unknown')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span dir="ltr">{order.customer?.phone || '—'}</span>
              </div>
              {order.delivery_info?.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-muted-foreground leading-snug">
                    {order.delivery_info.address.formatted_address}
                    <br />
                    {t('building_number')}: {order.delivery_info.address.building_number}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Courier Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                {t('courier_details')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.courier ? (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">{order.courier.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span dir="ltr">{order.courier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-medium">
                      {t(`vehicle_${order.courier.vehicle_type}`)}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {t(`delivery_status.${order.courier.status}`)}
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">{t('no_courier_assigned')}</p>
              )}
            </CardContent>
          </Card>

          {/* Payments Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                {t('payment_details')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.payments_count > 0 ? (
                <div className="space-y-3 text-sm">
                  {order.payments.map(payment => (
                    <div key={payment.id} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                      <div className="flex flex-col">
                        <span className="font-medium">{t(`payment_method.${payment.payment_method}`)}</span>
                        <span className="text-xs text-muted-foreground">{t(`payment_status.${payment.status}`)}</span>
                      </div>
                      <span className="font-bold">{payment.amount} L.E</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">{t('no_payments')}</p>
              )}
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('status_timeline')}</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusTimeline logs={order.status_logs} currentStatus={order.status} createdAt={order.created_at} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
