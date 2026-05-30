import { useTranslation } from 'react-i18next';
import { Phone, Copy, Eye, Clock, AlertTriangle } from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useExpiringSubscriptions } from '@/hooks/useSubscriptions';
import { useLanguagePreference } from '@/hooks/useLanguagePreference';
import { useFormatters } from '@/hooks/useFormatters';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function ExpiringSubscriptionsPage() {
  const { t } = useTranslation();
  const { language } = useLanguagePreference();
  const { formatPercent, formatDate } = useFormatters();
  const navigate = useNavigate();
  const { data, isLoading } = useExpiringSubscriptions();

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast.success(t('copied_to_clipboard'));
  };

  const getStatusBadge = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    
    const expiryDate = new Date(expiresAt);
    if (isPast(expiryDate)) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {t('expired')}
        </Badge>
      );
    }

    const daysLeft = differenceInDays(expiryDate, new Date());
    return (
      <Badge variant="outline" className="text-amber-600 border-amber-600 flex items-center gap-1 bg-amber-50">
        <Clock className="w-3 h-3" />
        {daysLeft === 0 
          ? t('expires_today') 
          : t('expires_in_days', { days: daysLeft })}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('expiring_subscriptions')} 
        description={t('expiring_subscriptions_desc')}
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('vendor_name')}</TableHead>
                <TableHead>{t('owner_info')}</TableHead>
                <TableHead>{t('subscription_plan')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5} className="h-16 animate-pulse bg-muted/20" />
                  </TableRow>
                ))
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((sub: any) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      {sub.vendor_name || `#${sub.vendor_id}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">{sub.owner_name}</span>
                        {sub.owner_phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span dir="ltr">{sub.owner_phone}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => handleCopyPhone(sub.owner_phone)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{sub.plan?.name[language as 'en' | 'ar']}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatPercent(sub.plan?.commission_percentage || 0)} {t('commission')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        {getStatusBadge(sub.expires_at)}
                        <span className="text-xs text-muted-foreground">
                          {sub.expires_at ? formatDate(sub.expires_at, { month: 'short', year: 'numeric', day: 'numeric' }) : '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/vendors/${sub.vendor_id}/edit`)}>
                        <Eye className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        {t('view_details')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    {t('no_expiring_subscriptions')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
