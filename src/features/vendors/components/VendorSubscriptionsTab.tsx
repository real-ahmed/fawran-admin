import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFormatters } from '@/hooks/useFormatters';
import { useVendorSubscriptions } from '@/hooks/useSubscriptions';
import { AssignSubscriptionModal } from './AssignSubscriptionModal';
import { useLanguagePreference } from '@/hooks/useLanguagePreference';
import { useQuery } from '@tanstack/react-query';
import { fetchSystemSettings } from '@/services/settingsService';

interface VendorSubscriptionsTabProps {
  vendorId: number;
}

export function VendorSubscriptionsTab({ vendorId }: VendorSubscriptionsTabProps) {
  const { t } = useTranslation();
  const { language } = useLanguagePreference();
  const { subscriptions, isLoading } = useVendorSubscriptions(vendorId);
  const { formatDate, formatPercent } = useFormatters();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const settingsQuery = useQuery({
    queryKey: ['system-settings'],
    queryFn: fetchSystemSettings,
    staleTime: Infinity,
  });

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">{t('common.loading', 'Loading...')}</div>;
  }

  const defaultCommission = settingsQuery.data?.default_store_commission || '10';

  const activeSubscription = subscriptions?.find((sub) => sub.status === 'active');
  const pastSubscriptions = subscriptions?.filter((sub) => sub.status !== 'active') || [];

  return (
    <div className="space-y-6 bg-card border rounded-xl p-6">
      <div className="flex items-center justify-between pb-2 border-b">
        <h3 className="text-lg font-semibold">{t('subscription_plans')}</h3>
        <Button size="sm" onClick={() => setIsAssignModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
          {t('assign_subscription')}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide text-muted-foreground">
            {t('active_subscription')}
          </h4>
          {activeSubscription ? (
            <Card className="p-6 border-primary bg-primary/5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{activeSubscription.plan?.name[language as 'en' | 'ar']}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatPercent(activeSubscription.plan?.commission_percentage || 0)} {t('commission')}
                  </p>
                </div>
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  {t('active')}
                </Badge>
              </div>
              
              <div className="text-sm space-y-2 mt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('starts_at')}:</span>
                  <span className="font-medium">
                    {activeSubscription.starts_at ? formatDate(activeSubscription.starts_at, { month: 'long' }) : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('expires_at')}:</span>
                  <span className="font-medium">
                    {activeSubscription.expires_at ? formatDate(activeSubscription.expires_at, { month: 'long' }) : t('never')}
                  </span>
                </div>
              </div>
            </Card>
          ) : (
            <div className="p-6 border border-dashed rounded-lg text-center text-muted-foreground">
              {t('no_active_subscription')}
              <p className="text-sm mt-1">{t('fallback_commission_notice', { value: defaultCommission })}</p>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide text-muted-foreground">
            {t('subscription_history')}
          </h4>
          <div className="space-y-3">
            {pastSubscriptions.length > 0 ? (
              pastSubscriptions.map((sub) => (
                <div key={sub.id} className="flex justify-between items-center p-3 rounded-lg border bg-muted/20 text-sm">
                  <div>
                    <p className="font-medium">{sub.plan?.name[language as 'en' | 'ar']}</p>
                    <p className="text-xs text-muted-foreground">
                      {sub.starts_at ? formatDate(sub.starts_at) : ''} - 
                      {sub.expires_at ? formatDate(sub.expires_at) : t('never')}
                    </p>
                  </div>
                  <Badge variant="outline" className={sub.status === 'expired' ? 'text-amber-600' : 'text-destructive'}>
                    {sub.status === 'expired' ? t('expired') : t('cancelled')}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">{t('no_history')}</div>
            )}
          </div>
        </div>
      </div>

      <AssignSubscriptionModal
        vendorId={vendorId}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
      />
    </div>
  );
}
