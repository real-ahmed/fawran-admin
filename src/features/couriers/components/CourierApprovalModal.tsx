import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Courier } from '@/types/courier';
import { approveCourier, rejectCourier } from '@/services/courierService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseApiError } from '@/utils/api';
import { Loader2, ExternalLink, User, Mail, Phone, CarFront, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CourierApprovalModalProps {
  courier: Courier | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CourierApprovalModal = ({ courier, isOpen, onClose }: CourierApprovalModalProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: (id: number) => approveCourier(id),
    onSuccess: () => {
      toast.success(t('courier_approved_successfully'));
      queryClient.invalidateQueries({ queryKey: ['couriers'] });
      onClose();
    },
    onError: (err) => {
      toast.error(parseApiError(err, t('error_saving')));
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectCourier(id),
    onSuccess: () => {
      toast.success(t('courier_rejected_successfully'));
      queryClient.invalidateQueries({ queryKey: ['couriers'] });
      onClose();
    },
    onError: (err) => {
      toast.error(parseApiError(err, t('error_saving')));
    }
  });

  if (!courier) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('review_courier')}</DialogTitle>
          <DialogDescription>
            {t('review_courier_desc')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Personal Info */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{t('personal_info')}</h4>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /> {courier.user.name}</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> {courier.user.email}</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {courier.user.phone}</div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{t('vehicle_info')}</h4>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CarFront className="h-4 w-4 text-primary" /> 
                <span className="capitalize">{courier.vehicle_type}</span>
                <Badge variant="outline" className="ml-2 rtl:mr-2 rtl:ml-0">{courier.plate_number}</Badge>
              </div>
              {courier.delivery_zone && (
                <div className="text-muted-foreground mt-1 text-xs">
                  {t('delivery_zone')}: <span className="font-medium text-foreground">{courier.delivery_zone.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{t('documents')}</h4>
            <div className="bg-muted/50 rounded-lg p-3 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>{t('criminal_record_file')}</span>
                </div>
                {courier.document?.criminal_record_file ? (
                  <a href={courier.document.criminal_record_file} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                    {t('view_document')} <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground text-xs">{t('not_provided')}</span>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>{t('contract_number')}</span>
                </div>
                <span className="font-medium">{courier.document?.contract_number || t('not_provided')}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="destructive"
            onClick={() => rejectMutation.mutate(courier.id)}
            disabled={rejectMutation.isPending || approveMutation.isPending}
          >
            {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('reject_courier')}
          </Button>
          <Button
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => approveMutation.mutate(courier.id)}
            disabled={approveMutation.isPending || rejectMutation.isPending}
          >
            {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('approve_courier')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
