import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { SubscriptionPlan } from '@/types/subscription';

interface SubscriptionPlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: SubscriptionPlan | null;
  onSubmit: (data: Partial<SubscriptionPlan>) => void;
  isLoading: boolean;
}

export function SubscriptionPlanFormModal({
  isOpen,
  onClose,
  plan,
  onSubmit,
  isLoading,
}: SubscriptionPlanFormModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    monthly_price: 0,
    commission_percentage: 10,
    is_active: true,
    features: {
      visibility_boost: false,
      advanced_analytics: false,
      marketing_tools: false,
      priority_support: false,
    },
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        name_en: plan.name.en,
        name_ar: plan.name.ar,
        monthly_price: plan.monthly_price,
        commission_percentage: plan.commission_percentage,
        is_active: plan.is_active,
        features: {
          visibility_boost: plan.features?.visibility_boost || false,
          advanced_analytics: plan.features?.advanced_analytics || false,
          marketing_tools: plan.features?.marketing_tools || false,
          priority_support: plan.features?.priority_support || false,
        },
      });
    } else {
      setFormData({
        name_en: '',
        name_ar: '',
        monthly_price: 0,
        commission_percentage: 10,
        is_active: true,
        features: {
          visibility_boost: false,
          advanced_analytics: false,
          marketing_tools: false,
          priority_support: false,
        },
      });
    }
  }, [plan, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: {
        en: formData.name_en,
        ar: formData.name_ar,
      },
      monthly_price: Number(formData.monthly_price),
      commission_percentage: Number(formData.commission_percentage),
      is_active: formData.is_active,
      features: formData.features,
    });
  };

  const handleFeatureToggle = (key: keyof typeof formData.features) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [key]: !prev.features[key],
      },
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {plan ? t('edit_plan') : t('add_plan')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('name_en')}</Label>
              <Input
                required
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('name_ar')}</Label>
              <Input
                required
                dir="rtl"
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('monthly_price')}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.monthly_price}
                onChange={(e) => setFormData({ ...formData, monthly_price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('commission_percentage')}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                value={formData.commission_percentage}
                onChange={(e) => setFormData({ ...formData, commission_percentage: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-semibold">{t('features')}</Label>
            
            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal cursor-pointer" onClick={() => handleFeatureToggle('visibility_boost')}>
                {t('feature_visibility_boost')}
              </Label>
              <Switch
                checked={formData.features.visibility_boost}
                onCheckedChange={() => handleFeatureToggle('visibility_boost')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal cursor-pointer" onClick={() => handleFeatureToggle('advanced_analytics')}>
                {t('feature_advanced_analytics')}
              </Label>
              <Switch
                checked={formData.features.advanced_analytics}
                onCheckedChange={() => handleFeatureToggle('advanced_analytics')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal cursor-pointer" onClick={() => handleFeatureToggle('marketing_tools')}>
                {t('feature_marketing_tools')}
              </Label>
              <Switch
                checked={formData.features.marketing_tools}
                onCheckedChange={() => handleFeatureToggle('marketing_tools')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal cursor-pointer" onClick={() => handleFeatureToggle('priority_support')}>
                {t('feature_priority_support')}
              </Label>
              <Switch
                checked={formData.features.priority_support}
                onCheckedChange={() => handleFeatureToggle('priority_support')}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Label className="text-sm font-semibold cursor-pointer" onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}>
              {t('active')}
            </Label>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('saving') : t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
