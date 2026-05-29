import { AlertTriangle, Loader2, ShoppingCart, Store, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PendingApprovals } from '@/services/dashboardService';
import { getLocalizedDisplayName } from '@/utils/displayName';
import { PendingApprovalsCard } from './PendingApprovalsCard';

type PendingCourier = PendingApprovals['couriers'][number] & {
  user?: {
    name?: string | null;
  };
};

interface PendingApprovalsSectionProps {
  pending?: PendingApprovals;
  isLoading: boolean;
  loadingId: number | null;
  onApproveBrand: (id: number) => void;
  onRejectBrand: (id: number) => void;
  onApproveCategory: (id: number) => void;
  onRejectCategory: (id: number) => void;
  onApproveCourier: (id: number) => void;
  onRejectCourier: (id: number) => void;
}

export const PendingApprovalsSection = ({
  pending,
  isLoading,
  loadingId,
  onApproveBrand,
  onRejectBrand,
  onApproveCategory,
  onRejectCategory,
  onApproveCourier,
  onRejectCourier,
}: PendingApprovalsSectionProps) => {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        {t('pending_approvals')}
        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground ms-1" />}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PendingApprovalsCard
          title={t('brands')}
          items={(pending?.brands ?? []).map((brand) => ({
            id: brand.id,
            name: getLocalizedDisplayName(brand, i18n.language),
          }))}
          icon={<Store className="h-4 w-4 text-primary" />}
          onApprove={onApproveBrand}
          onReject={onRejectBrand}
          loadingId={loadingId}
        />
        <PendingApprovalsCard
          title={t('categories')}
          items={(pending?.categories ?? []).map((category) => ({
            id: category.id,
            name: getLocalizedDisplayName(category, i18n.language),
          }))}
          icon={<ShoppingCart className="h-4 w-4 text-primary" />}
          onApprove={onApproveCategory}
          onReject={onRejectCategory}
          loadingId={loadingId}
        />
        <PendingApprovalsCard
          title={t('couriers')}
          items={(pending?.couriers ?? []).map((courier: PendingCourier) => ({
            id: courier.id,
            name: courier.user?.name || courier.name || t('unknown'),
          }))}
          icon={<Truck className="h-4 w-4 text-primary" />}
          onApprove={onApproveCourier}
          onReject={onRejectCourier}
          loadingId={loadingId}
        />
      </div>
    </div>
  );
};
