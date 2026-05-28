import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Order } from '@/types/order';
import { OrderStatus } from '@/types/enums';
import { updateOrderStatus, cancelOrder } from '@/services/ordersService';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, Loader2, Ban, Truck } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AssignCourierModal } from './AssignCourierModal';
import { useHasPermission } from '@/hooks/useHasPermission';
import { PERMISSIONS } from '@/config/permissions';

interface OrderActionButtonsProps {
  order: Order;
}

export const OrderActionButtons = ({ order }: OrderActionButtonsProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const [isAssignCourierModalOpen, setIsAssignCourierModalOpen] = useState(false);

  const canUpdateStatus = useHasPermission(PERMISSIONS.UPDATE_ORDER_STATUS);
  const canAssignCourier = useHasPermission(PERMISSIONS.ASSIGN_COURIER_TO_ORDER);
  const canCancelOrder = useHasPermission(PERMISSIONS.CANCEL_ORDERS);

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: string) => updateOrderStatus(order.id, newStatus),
    onSuccess: () => {
      toast.success(t('order_status_updated_successfully'));
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t('error_updating_status'));
    }
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(order.id),
    onSuccess: () => {
      toast.success(t('order_cancelled_successfully'));
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setIsCancelAlertOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t('error_cancelling_order'));
      setIsCancelAlertOpen(false);
    }
  });

  // Calculate allowed transitions
  const allowedNextStatuses: string[] = [];
  if (order.status === OrderStatus.Pending) allowedNextStatuses.push(OrderStatus.Processing);
  if (order.status === OrderStatus.Processing) allowedNextStatuses.push(OrderStatus.OutForDelivery);
  if (order.status === OrderStatus.OutForDelivery) allowedNextStatuses.push(OrderStatus.Delivered);

  const isFinalStatus = order.status === OrderStatus.Delivered || order.status === OrderStatus.Cancelled;

  return (
    <div className="flex items-center gap-3">
      {canAssignCourier && !isFinalStatus && !order.courier && order.order_type === 'delivery' && (
        <Button variant="outline" onClick={() => setIsAssignCourierModalOpen(true)} className="gap-2">
          <Truck className="h-4 w-4" />
          {t('assign_courier')}
        </Button>
      )}

      {canUpdateStatus && allowedNextStatuses.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={updateStatusMutation.isPending} className="gap-2 min-w-[140px]">
              {updateStatusMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('update_status')}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {allowedNextStatuses.map(status => (
              <DropdownMenuItem key={status} onClick={() => updateStatusMutation.mutate(status)}>
                {t(`mark_as_${status}`)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {canCancelOrder && !isFinalStatus && (
        <Button variant="destructive" onClick={() => setIsCancelAlertOpen(true)} className="gap-2">
          <Ban className="h-4 w-4" />
          {t('cancel_order')}
        </Button>
      )}

      <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_cancel_order')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm_cancel_order_desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('keep_order')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => cancelMutation.mutate()}
            >
              {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t('cancel_order_confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AssignCourierModal 
        isOpen={isAssignCourierModalOpen} 
        onClose={() => setIsAssignCourierModalOpen(false)} 
        orderId={order.id} 
      />
    </div>
  );
};
