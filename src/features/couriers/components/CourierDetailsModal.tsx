import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Courier } from '@/types/courier';
import { ExternalLink, User, Mail, Phone, CarFront, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CourierDetailsModalProps {
  courier: Courier | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: (id: number) => void;
}

export const CourierDetailsModal = ({ courier, isOpen, onClose, onPrint }: CourierDetailsModalProps) => {
  const { t, i18n } = useTranslation();

  if (!courier) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('courier_details')}</DialogTitle>
          <DialogDescription>
            {t('view_courier_details_desc')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Personal Info */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{t('personal_info')}</h4>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /> {courier.user?.name}</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> {courier.user?.email}</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {courier.user?.phone}</div>
              {courier.national_id && (
                <div className="flex items-center gap-2 text-muted-foreground pt-1 border-t border-border/50">
                  <span className="font-semibold text-foreground text-xs uppercase">{t('national_id')}:</span> 
                  <span className="font-medium font-mono text-foreground">{courier.national_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{t('vehicle_info')}</h4>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CarFront className="h-4 w-4 text-primary" /> 
                  <span>{t(`vehicle_${courier.vehicle_type}`)}</span>
                  {courier.plate_number && (
                    <Badge variant="outline" className="ml-2 rtl:mr-2 rtl:ml-0">{courier.plate_number}</Badge>
                  )}
                </div>
                <Badge variant={courier.is_online ? 'default' : 'secondary'} className="text-xs">
                  {courier.is_online ? t('online') : t('offline')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Documents & Approval */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{t('documents_and_status')}</h4>
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
                <div className="flex items-center gap-3">
                  <span className="font-medium">{courier.document?.contract_number || t('not_provided')}</span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => onPrint(courier.id)}
                  >
                    {t('print_contract')}
                  </Button>
                </div>
              </div>

              {courier.approval && (
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span>{t('approved_at')}</span>
                  </div>
                  <span className="font-medium">
                    {new Date(courier.approval.approved_at).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
