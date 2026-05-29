import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CreditCard, DollarSign, Package, Truck, Store, Wallet, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { financeService } from '@/services/financeService';
import { Money } from '@/components/Money';

export const FinancesOverview = () => {
  const { t } = useTranslation();

  const { data: overview, isLoading } = useQuery({
    queryKey: ['finances-overview'],
    queryFn: financeService.getOverview,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('finances')}
          description={t('finances_overview_description')}
          icon={CreditCard}
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-card border border-border/40" />
          ))}
        </div>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title={t('finances')}
        description={t('finances_overview_description')}
        icon={CreditCard}
      />

      {/* Platform & System Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 text-primary">
            <Wallet size={80} />
          </div>
          <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            {t('platform_wallet')}
          </h3>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{t('current_balance')}</span>
            <span className="text-3xl font-bold text-foreground">
              <Money amount={overview.platform.current_balance} />
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-primary/10 flex justify-between">
            <span className="text-sm text-muted-foreground">{t('total_revenue')}:</span>
            <span className="text-sm font-medium text-foreground">
              <Money amount={overview.platform.total_revenue} />
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 text-blue-500">
            <Package size={80} />
          </div>
          <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
            <Store className="w-4 h-4" />
            {t('commissions')}
          </h3>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{t('total_platform_profit')}</span>
            <span className="text-3xl font-bold text-foreground">
              <Money amount={overview.commissions.total_platform_profit} />
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-500/10 grid grid-cols-2 gap-4">
             <div>
               <span className="block text-xs text-muted-foreground">{t('total_vendorcommission')}</span>
               <span className="block text-sm font-medium text-foreground mt-1">
                 <Money amount={overview.commissions.total_vendorcommission} />
               </span>
             </div>
             <div>
               <span className="block text-xs text-muted-foreground">{t('total_delivery_share')}</span>
               <span className="block text-sm font-medium text-foreground mt-1">
                 <Money amount={overview.commissions.total_delivery_share} />
               </span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Unsettled Cash */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
            <Truck className="w-4 h-4" />
            {t('courier_cash')}
          </h3>
          <div className="mb-4">
            <span className="text-xs text-muted-foreground">{t('unsettled_total')}</span>
            <p className="text-2xl font-bold text-foreground mt-1">
              <Money amount={overview.cash.unsettled_total} />
            </p>
          </div>
          <div className="flex items-center justify-between text-sm">
             <span className="text-muted-foreground">{t('unsettled_count')}:</span>
             <span className="font-medium">{overview.cash.unsettled_count}</span>
          </div>
           <div className="flex items-center justify-between text-sm mt-1">
             <span className="text-muted-foreground">{t('total_collected')}:</span>
             <span className="font-medium"><Money amount={overview.cash.total_collected} /></span>
          </div>
        </div>

        {/* Pending Payouts */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {t('payout_requests')}
          </h3>
          <div className="mb-4">
            <span className="text-xs text-muted-foreground">{t('pending_total')}</span>
            <p className="text-2xl font-bold text-foreground mt-1">
              <Money amount={overview.payouts.pending_total} />
            </p>
          </div>
          <div className="flex items-center justify-between text-sm">
             <span className="text-muted-foreground">{t('pending_count')}:</span>
             <span className="font-medium">{overview.payouts.pending_count}</span>
          </div>
           <div className="flex items-center justify-between text-sm mt-1">
             <span className="text-muted-foreground">{t('transferred_total')}:</span>
             <span className="font-medium"><Money amount={overview.payouts.transferred_total} /></span>
          </div>
        </div>

        {/* Settlements */}
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            {t('settlements')}
          </h3>
          <div className="mb-4">
            <span className="text-xs text-muted-foreground">{t('pending_total')}</span>
            <p className="text-2xl font-bold text-foreground mt-1">
              <Money amount={overview.settlements.pending_total} />
            </p>
          </div>
          <div className="flex items-center justify-between text-sm">
             <span className="text-muted-foreground">{t('pending_count')}:</span>
             <span className="font-medium">{overview.settlements.pending_count}</span>
          </div>
           <div className="flex items-center justify-between text-sm mt-1">
             <span className="text-muted-foreground">{t('completed_count')}:</span>
             <span className="font-medium">{overview.settlements.completed_count}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
