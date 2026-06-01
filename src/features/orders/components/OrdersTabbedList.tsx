import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderStatus } from '@/types/enums';
import { OrdersList } from './OrdersList';
import { useOrderStatusCounts } from '../hooks/useOrderStatusCounts';

interface OrdersTabbedListProps {
  vendorId?: number;
  courierId?: number;
}

export const OrdersTabbedList = ({ vendorId, courierId }: OrdersTabbedListProps) => {
  const { t, i18n } = useTranslation();
  const { data: counts } = useOrderStatusCounts({ vendor_id: vendorId, courier_id: courierId });

  return (
    <Tabs defaultValue="all" className="w-full" dir={i18n.dir()}>
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 p-1 bg-muted/50 rounded-lg mb-6 h-auto">
        <TabsTrigger value="all" className="py-2.5 rounded-md gap-2">
          {t('all_orders')}
          {counts?.all !== undefined && (
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">{counts.all}</span>
          )}
        </TabsTrigger>
        <TabsTrigger value={OrderStatus.Pending} className="py-2.5 rounded-md gap-2">
          {t('pending')}
          {counts?.pending !== undefined && (
            <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full text-xs">{counts.pending}</span>
          )}
        </TabsTrigger>
        <TabsTrigger value={OrderStatus.Processing} className="py-2.5 rounded-md gap-2">
          {t('processing')}
          {counts?.processing !== undefined && (
            <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full text-xs">{counts.processing}</span>
          )}
        </TabsTrigger>
        <TabsTrigger value={OrderStatus.OutForDelivery} className="py-2.5 rounded-md gap-2">
          {t('out_for_delivery')}
          {counts?.out_for_delivery !== undefined && (
            <span className="bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full text-xs">{counts.out_for_delivery}</span>
          )}
        </TabsTrigger>
        <TabsTrigger value={OrderStatus.Delivered} className="py-2.5 rounded-md gap-2">
          {t('delivered')}
          {counts?.delivered !== undefined && (
            <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full text-xs">{counts.delivered}</span>
          )}
        </TabsTrigger>
        <TabsTrigger value={OrderStatus.Cancelled} className="py-2.5 rounded-md gap-2">
          {t('cancelled')}
          {counts?.cancelled !== undefined && (
            <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full text-xs">{counts.cancelled}</span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-0 outline-none">
        <OrdersList vendorId={vendorId} courierId={courierId} />
      </TabsContent>

      <TabsContent value={OrderStatus.Pending} className="mt-0 outline-none">
        <OrdersList status={OrderStatus.Pending} vendorId={vendorId} courierId={courierId} />
      </TabsContent>

      <TabsContent value={OrderStatus.Processing} className="mt-0 outline-none">
        <OrdersList status={OrderStatus.Processing} vendorId={vendorId} courierId={courierId} />
      </TabsContent>

      <TabsContent value={OrderStatus.OutForDelivery} className="mt-0 outline-none">
        <OrdersList status={OrderStatus.OutForDelivery} vendorId={vendorId} courierId={courierId} />
      </TabsContent>

      <TabsContent value={OrderStatus.Delivered} className="mt-0 outline-none">
        <OrdersList status={OrderStatus.Delivered} vendorId={vendorId} courierId={courierId} />
      </TabsContent>

      <TabsContent value={OrderStatus.Cancelled} className="mt-0 outline-none">
        <OrdersList status={OrderStatus.Cancelled} vendorId={vendorId} courierId={courierId} />
      </TabsContent>
    </Tabs>
  );
};
