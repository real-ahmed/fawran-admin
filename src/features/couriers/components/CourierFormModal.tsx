import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Courier } from '@/types/courier';
import { updateCourier } from '@/services/courierService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseApiError } from '@/utils/api';
import { Loader2 } from 'lucide-react';

interface CourierFormModalProps {
  courier: Courier | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CourierFormModal = ({ courier, isOpen, onClose }: CourierFormModalProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    national_id: '',
    vehicle_type: 'motorcycle',
    plate_number: '',
  });

  useEffect(() => {
    if (courier && isOpen) {
      setFormData({
        name: courier.user?.name || '',
        phone: courier.user?.phone || '',
        national_id: courier.national_id || '',
        vehicle_type: courier.vehicle_type || 'motorcycle',
        plate_number: courier.plate_number || '',
      });
    }
  }, [courier, isOpen]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateCourier(courier!.id, data),
    onSuccess: () => {
      toast.success(t('updated_successfully'));
      queryClient.invalidateQueries({ queryKey: ['couriers'] });
      onClose();
    },
    onError: (err) => {
      toast.error(parseApiError(err, t('error_saving')));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courier) return;

    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('edit_courier')}</DialogTitle>
            <DialogDescription>
              {t('edit_courier_desc')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')} <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone')} <span className="text-destructive">*</span></Label>
              <Input
                id="phone"
                dir="ltr"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vehicle_type">{t('vehicle_type')} <span className="text-destructive">*</span></Label>
              <Select value={formData.vehicle_type} onValueChange={(val) => setFormData(prev => ({ ...prev, vehicle_type: val }))}>
                <SelectTrigger dir="auto">
                  <SelectValue placeholder={t('select_vehicle_type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motorcycle">{t('vehicle_motorcycle')}</SelectItem>
                  <SelectItem value="bicycle">{t('vehicle_bicycle')}</SelectItem>
                  <SelectItem value="car">{t('vehicle_car')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="national_id">{t('national_id')}</Label>
              <Input
                id="national_id"
                value={formData.national_id}
                onChange={(e) => setFormData(prev => ({ ...prev, national_id: e.target.value }))}
                placeholder={t('enter_national_id')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plate_number">{t('plate_number')}</Label>
              <Input
                id="plate_number"
                value={formData.plate_number}
                onChange={(e) => setFormData(prev => ({ ...prev, plate_number: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('save_changes')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
