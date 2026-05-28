import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AssignCourierRequest } from '@/types/api';
import { assignCourierToOrder } from '@/services/ordersService';
import { useCouriersList } from '@/features/couriers/hooks/useCouriersList';
import { ApprovalStatus } from '@/types/enums';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface AssignCourierModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
}

export const AssignCourierModal = ({ isOpen, onClose, orderId }: AssignCourierModalProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedCourierId, setSelectedCourierId] = useState<string>('');

  // Fetch approved, online couriers
  const { couriers, isLoading } = useCouriersList({
    approvalStatus: ApprovalStatus.Approved,
    // online_status: 'online' -> we could pass this if API supported filtering by it, for now we filter client side
  });

  const onlineCouriers = couriers.filter(c => c.is_online);

  const assignMutation = useMutation({
    mutationFn: () => assignCourierToOrder(orderId, parseInt(selectedCourierId)),
    onSuccess: () => {
      toast.success(t('courier_assigned_successfully'));
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onClose();
      setSelectedCourierId('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t('error_assigning_courier'));
    }
  });

  const handleAssign = () => {
    if (!selectedCourierId) return;
    assignMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('assign_courier')}</DialogTitle>
          <DialogDescription>
            {t('assign_courier_desc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('select_courier')}</label>
            <Select value={selectedCourierId} onValueChange={setSelectedCourierId}>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? t('loading') : t('select_courier_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {onlineCouriers.length === 0 ? (
                  <SelectItem value="empty" disabled>{t('no_online_couriers')}</SelectItem>
                ) : (
                  onlineCouriers.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.user?.name} - {c.user?.phone} ({t(`vehicle_${c.vehicle_type}`)})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={assignMutation.isPending}>
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedCourierId || assignMutation.isPending}
            className="gap-2"
          >
            {assignMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('assign')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
