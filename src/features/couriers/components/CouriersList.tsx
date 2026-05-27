import { useTranslation } from 'react-i18next';
import { Courier } from '@/types/courier';
import { useCouriersList } from '../hooks/useCouriersList';
import { useInView } from 'react-intersection-observer';
import { EmptyState } from '@/components/EmptyState';
import { Bike, CarFront, Navigation, User, AlertCircle, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { CourierApprovalModal } from './CourierApprovalModal';

interface CouriersListProps {
  approvalStatus: 'pending' | 'approved';
}

export const CouriersList = ({ approvalStatus }: CouriersListProps) => {
  const { t } = useTranslation();
  const { ref, inView } = useInView();
  const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useCouriersList({
    approval_status: approvalStatus
  });

  const couriers = data?.pages.flatMap(page => page.data) || [];

  if (inView && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'motorcycle': return <Bike className="h-5 w-5" />;
      case 'bicycle': return <Bike className="h-5 w-5" />;
      case 'car': return <CarFront className="h-5 w-5" />;
      default: return <CarFront className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card p-6 h-48 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-10 text-destructive">{t('error_loading_couriers')}</div>
      ) : couriers.length === 0 ? (
        <EmptyState
          icon={Navigation}
          title={t('no_couriers_found')}
          description={t('no_couriers_found_desc')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {couriers.map(courier => (
            <div key={courier.id} className="group relative overflow-hidden rounded-xl border border-border/60 bg-card transition-all hover:shadow-md flex flex-col">
              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {getVehicleIcon(courier.vehicle_type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base line-clamp-1">
                        {courier.user?.name || t('unknown')}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-secondary text-secondary-foreground`}>
                          {t(`vehicle_${courier.vehicle_type}`)}
                        </span>
                        {approvalStatus === 'approved' && (
                          <Badge variant={courier.is_online ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                            {courier.is_online ? t('online') : t('offline')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 shrink-0" />
                    <span>{courier.user?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">{courier.delivery_zone?.name || t('no_zone_assigned')}</span>
                  </div>
                </div>
              </div>

              {approvalStatus === 'pending' && (
                <div className="p-4 border-t border-border/60 bg-muted/20 flex gap-3">
                  <Button 
                    className="w-full gap-2" 
                    variant="outline"
                    onClick={() => setSelectedCourier(courier)}
                  >
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    {t('review_application')}
                  </Button>
                </div>
              )}

              {approvalStatus === 'approved' && (
                <div className="p-4 border-t border-border/60 bg-muted/20 flex gap-3">
                  <Button 
                    className="w-full gap-2" 
                    variant="outline"
                    onClick={() => window.open(`/api/v1/admin/couriers/${courier.id}/contract/print`, '_blank')}
                  >
                    <Printer className="h-4 w-4 text-primary" />
                    {t('print_contract')}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isFetchingNextPage && (
        <div className="py-4 flex justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}
      
      <div ref={ref} className="h-4 w-full" />

      <CourierApprovalModal 
        courier={selectedCourier} 
        isOpen={selectedCourier !== null} 
        onClose={() => setSelectedCourier(null)} 
      />
    </div>
  );
};
