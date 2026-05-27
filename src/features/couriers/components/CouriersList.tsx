import { useTranslation } from 'react-i18next';
import { Courier } from '@/types/courier';
import { getLocalizedDisplayName } from '@/utils/displayName';
import { useCouriersList } from '../hooks/useCouriersList';
import { EmptyState } from '@/components/EmptyState';
import { Bike, CarFront, Navigation, User, AlertCircle, Printer, Loader2, Eye, Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { CourierApprovalModal } from './CourierApprovalModal';
import { CourierDetailsModal } from './CourierDetailsModal';
import { CourierFormModal } from './CourierFormModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import * as courierService from '@/services/courierService';
import { toast } from 'sonner';
import { CouriersToolbar } from './CouriersToolbar';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { parseApiError } from '@/utils/api';

interface CouriersListProps {
  approvalStatus: 'pending' | 'approved';
}

export const CouriersList = ({ approvalStatus }: CouriersListProps) => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [courierToDelete, setCourierToDelete] = useState<Courier | null>(null);

  const {
    couriers,
    isLoading,
    isError,
    isFetchingNextPage,
    loadMoreRef,
    filters,
    setSearchTerm,
    setVehicleType,
    setOnlineStatus,
    setDeliveryZoneId,
    clearFilters,
    deliveryZones,
    isLoadingDeliveryZones,
  } = useCouriersList({
    approvalStatus,
  });

  // Sync selectedCourier with fresh data when couriers array updates
  useEffect(() => {
    if (selectedCourier && couriers.length > 0) {
      const freshCourier = couriers.find(c => c.id === selectedCourier.id);
      // Only update if the contract number changed to avoid unnecessary re-renders
      if (freshCourier?.document?.contract_number && freshCourier.document.contract_number !== selectedCourier.document?.contract_number) {
        setSelectedCourier(freshCourier);
      }
    }
  }, [couriers, selectedCourier]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => courierService.deleteCourier(id),
    onSuccess: () => {
      toast.success(t('deleted_successfully'));
      queryClient.invalidateQueries({ queryKey: ['couriers'] });
      setCourierToDelete(null);
    },
    onError: (err) => {
      toast.error(parseApiError(err, t('error_deleting')));
      setCourierToDelete(null);
    }
  });

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handlePrint = async (courierId: number) => {
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      toast.error(t('popup_blocked'));

      return;
    }

    try {
      const contractHtml = await courierService.getCourierContractPrintHtml(courierId);
      printWindow.document.write(contractHtml);
      printWindow.document.close();

      queryClient.invalidateQueries({ queryKey: ['couriers'] });

      if (selectedCourier?.id === courierId) {
        const refreshedCourier = await courierService.getCourier(courierId);
        setSelectedCourier(refreshedCourier);
      }
    } catch (error) {
      printWindow.close();
      toast.error(t('error_printing'));
    }
  };

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
      <CouriersToolbar
        searchTerm={filters.searchTerm}
        vehicleType={filters.vehicleType}
        onlineStatus={filters.onlineStatus}
        deliveryZoneId={filters.deliveryZoneId}
        deliveryZones={deliveryZones}
        isLoadingDeliveryZones={isLoadingDeliveryZones}
        onSearchChange={setSearchTerm}
        onVehicleTypeChange={setVehicleType}
        onOnlineStatusChange={setOnlineStatus}
        onDeliveryZoneChange={setDeliveryZoneId}
        onClearFilters={clearFilters}
      />

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
                          <Badge
                            variant={courier.is_online ? 'default' : 'destructive'}
                            className="text-[10px] px-1.5 py-0"
                          >
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
                    <span className="line-clamp-1">
                      {courier.delivery_zone 
                        ? getLocalizedDisplayName(courier.delivery_zone, i18n.language) 
                        : t('no_zone_assigned')}
                    </span>
                  </div>
                </div>
              </div>

              {approvalStatus === 'pending' && (
                <div className="p-4 border-t border-border/60 bg-muted/20 flex gap-3">
                  <Button 
                    className="w-full gap-2" 
                    variant="outline"
                    onClick={() => {
                      setSelectedCourier(courier);
                      setIsApprovalModalOpen(true);
                    }}
                  >
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    {t('review_application')}
                  </Button>
                </div>
              )}

              {approvalStatus === 'approved' && (
                <div className="p-4 border-t border-border/60 bg-muted/20 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => handleActionClick(e, () => {
                        setSelectedCourier(courier);
                        setIsDetailsModalOpen(true);
                      })}>
                        <Eye className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                        {t('view_details')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleActionClick(e, () => {
                        setSelectedCourier(courier);
                        setIsEditModalOpen(true);
                      })}>
                        <Edit className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                        {t('edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleActionClick(e, () => handlePrint(courier.id))}>
                        <Printer className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                        {t('print_contract')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onClick={(e) => handleActionClick(e, () => setCourierToDelete(courier))}
                      >
                        <Trash2 className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                        {t('delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
      
      <div ref={loadMoreRef} className="h-4 w-full" />

      <CourierApprovalModal 
        courier={selectedCourier} 
        isOpen={isApprovalModalOpen} 
        onClose={() => setIsApprovalModalOpen(false)} 
        onPrint={handlePrint}
      />

      <CourierDetailsModal
        courier={selectedCourier}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onPrint={handlePrint}
      />

      <CourierFormModal
        courier={selectedCourier}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <AlertDialog open={!!courierToDelete} onOpenChange={(open) => !open && setCourierToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm_delete_message')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => courierToDelete && deleteMutation.mutate(courierToDelete.id)}
            >
              {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
