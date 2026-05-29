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
import { Loader2 } from 'lucide-react';
import { SearchableSelect } from '@/components/SearchableSelect';
import { parseApiError } from '@/utils/api';

interface AssignCourierModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
}

export const AssignCourierModal = ({ isOpen, onClose, orderId }: AssignCourierModalProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedCourierId, setSelectedCourierId] = useState<string>('');

  const {
    couriers,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    loadMoreRef,
    filters,
    setSearchTerm,
  } = useCouriersList({
    approvalStatus: ApprovalStatus.Approved,
    initialOnlineStatus: 'online',
  });

  const courierOptions = couriers.map((courier) => ({
    value: String(courier.id),
    label: courier.user?.name || t('unknown'),
    description: [courier.user?.phone, t(`vehicle_${courier.vehicle_type}`)].filter(Boolean).join(' - '),
  }));

  const assignMutation = useMutation({
    mutationFn: () => assignCourierToOrder(orderId, parseInt(selectedCourierId)),
    onSuccess: () => {
      toast.success(t('courier_assigned_successfully'));
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onClose();
      setSelectedCourierId('');
    },
    onError: (error) => {
      toast.error(parseApiError(error, t('error_assigning_courier')));
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
            <SearchableSelect
              value={selectedCourierId}
              options={courierOptions}
              onChange={setSelectedCourierId}
              placeholder={t('select_courier_placeholder')}
              emptyMessage={t('no_online_couriers')}
              searchTerm={filters.searchTerm}
              onSearchChange={setSearchTerm}
              isLoading={isLoading}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={Boolean(hasNextPage)}
              loadMoreRef={loadMoreRef}
            />
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
