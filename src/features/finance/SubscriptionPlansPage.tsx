import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';
import { useSubscriptionPlans } from '@/hooks/useSubscriptions';
import { SubscriptionPlan } from '@/types/subscription';
import { SubscriptionPlanFormModal } from './components/SubscriptionPlanFormModal';
import { useLanguagePreference } from '@/hooks/useLanguagePreference';
import { useFormatters } from '@/hooks/useFormatters';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function SubscriptionPlansPage() {
  const { t } = useTranslation();
  const { language } = useLanguagePreference();
  const { formatCurrency, formatPercent } = useFormatters();
  const { plans, isLoading, createPlan, updatePlan, deletePlan } = useSubscriptionPlans();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleOpenModal = (plan?: SubscriptionPlan) => {
    setSelectedPlan(plan || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handleSubmit = (data: Partial<SubscriptionPlan>) => {
    if (selectedPlan) {
      updatePlan.mutate(
        { id: selectedPlan.id, data },
        { onSuccess: handleCloseModal }
      );
    } else {
      createPlan.mutate(data, { onSuccess: handleCloseModal });
    }
  };

  const confirmDelete = () => {
    if (deleteId) {
      deletePlan.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('subscription_plans')} 
        description={t('subscription_plans_desc')}
      >
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
          {t('add_plan')}
        </Button>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 h-64 animate-pulse bg-muted/50" />
          ))
        ) : plans?.map((plan) => (
          <Card key={plan.id} className={`flex flex-col relative overflow-hidden transition-all hover:shadow-md ${!plan.is_active ? 'opacity-70 grayscale-[0.5]' : ''}`}>
            {!plan.is_active && (
              <div className="absolute top-0 right-0 left-0 bg-destructive/10 text-destructive text-xs font-semibold py-1 text-center">
                {t('inactive')}
              </div>
            )}
            
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{plan.name[language as 'en' | 'ar']}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{formatCurrency(plan.monthly_price)}</span>
                    <span className="text-sm text-muted-foreground">/ {t('month')}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-lg">
                  {formatPercent(plan.commission_percentage || 0)}
                </Badge>
              </div>

              <div className="space-y-2 mt-6">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {t('features')}
                </p>
                {plan.features?.visibility_boost && (
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 rounded-full bg-primary mr-2 rtl:ml-2 rtl:mr-0" />
                    {t('feature_visibility_boost')}
                  </div>
                )}
                {plan.features?.advanced_analytics && (
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 rounded-full bg-primary mr-2 rtl:ml-2 rtl:mr-0" />
                    {t('feature_advanced_analytics')}
                  </div>
                )}
                {plan.features?.marketing_tools && (
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 rounded-full bg-primary mr-2 rtl:ml-2 rtl:mr-0" />
                    {t('feature_marketing_tools')}
                  </div>
                )}
                {plan.features?.priority_support && (
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 rounded-full bg-primary mr-2 rtl:ml-2 rtl:mr-0" />
                    {t('feature_priority_support')}
                  </div>
                )}
                {(!plan.features || Object.values(plan.features).every(v => !v)) && (
                  <div className="text-sm text-muted-foreground italic">
                    {t('no_features')}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted/30 p-4 flex justify-end gap-2 border-t">
              <Button variant="ghost" size="sm" onClick={() => handleOpenModal(plan)}>
                <Edit2 className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('edit')}
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(plan.id)}>
                <Trash2 className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('delete')}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <SubscriptionPlanFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        plan={selectedPlan}
        onSubmit={handleSubmit}
        isLoading={createPlan.isPending || updatePlan.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete_plan_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete_plan_desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePlan.isPending}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deletePlan.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deletePlan.isPending ? t('deleting') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
