import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useSubscriptionPlans, useVendorSubscriptions } from '@/hooks/useSubscriptions';
import { useLanguagePreference } from '@/hooks/useLanguagePreference';
import { SearchableSelect } from '@/components/SearchableSelect';

interface AssignSubscriptionModalProps {
  vendorId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function AssignSubscriptionModal({ vendorId, isOpen, onClose }: AssignSubscriptionModalProps) {
  const { t } = useTranslation();
  const { language } = useLanguagePreference();
  const { plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { assignSubscription } = useVendorSubscriptions(vendorId);

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [duration, setDuration] = useState<string>('1');

  const durationOptions = [
    { value: '1', label: t('vendors.duration_1_month', '1 Month') },
    { value: '3', label: t('vendors.duration_3_months', '3 Months') },
    { value: '6', label: t('vendors.duration_6_months', '6 Months') },
    { value: '12', label: t('vendors.duration_1_year', '1 Year') },
    { value: '0', label: t('vendors.duration_unlimited', 'Unlimited') },
  ];

  const planOptions = plans?.filter(p => p.is_active).map(plan => ({
    value: String(plan.id),
    label: `${plan.name[language as 'en' | 'ar']} (${plan.commission_percentage}%)`,
  })) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return;

    assignSubscription.mutate({
      plan_id: selectedPlanId,
      duration_months: duration === '0' ? undefined : Number(duration),
    }, {
      onSuccess: () => {
        onClose();
        setSelectedPlanId(null);
        setDuration('1');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('vendors.assign_subscription', 'Assign Subscription')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>{t('finance.subscription_plan', 'Subscription Plan')}</Label>
            <SearchableSelect
              value={selectedPlanId ? String(selectedPlanId) : ''}
              options={planOptions}
              onChange={(value) => setSelectedPlanId(Number(value))}
              placeholder={t('common.select_option', 'Select...')}
              isLoading={plansLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('vendors.duration', 'Duration')}</Label>
            <SearchableSelect
              value={duration}
              options={durationOptions}
              onChange={(value) => setDuration(value)}
              placeholder={t('vendors.duration', 'Duration')}
            />
          </div>

          <p className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
            {t('vendors.assign_subscription_warning', 'Assigning a new subscription will immediately expire any currently active subscription for this vendor.')}
          </p>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={assignSubscription.isPending}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={assignSubscription.isPending || !selectedPlanId}>
              {assignSubscription.isPending ? t('common.saving', 'Saving...') : t('common.assign', 'Assign')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
