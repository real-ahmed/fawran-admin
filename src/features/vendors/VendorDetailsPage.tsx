import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, ArrowLeft, Store, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Money } from '@/components/Money';
import { useQuery } from '@tanstack/react-query';
import { getVendor } from '@/services/vendorService';
import { useVendorWalletTransactions } from './hooks/useVendorWalletTransactions';
import { OrdersList } from '@/features/orders/components/OrdersList';
import { WalletTransactionsList } from '@/components/WalletTransactionsList';
import { VendorProductsList } from './components/VendorProductsList';
import { getLocalizedDisplayName } from '@/utils/displayName';
import { VendorType } from '@/types/vendor';

export const VendorDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { data: vendor, isLoading, isError } = useQuery({
    queryKey: ['vendor', id],
    queryFn: () => getVendor(Number(id)),
    enabled: !!id,
  });

  const {
    transactions,
    isLoading: isWalletLoading,
    isError: isWalletError,
    hasNextPage,
    isFetchingNextPage,
    loadMoreRef
  } = useVendorWalletTransactions(Number(id));

  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !vendor) {
    return (
      <div className="py-10 text-center text-destructive">
        {t('error_loading_vendor')}
      </div>
    );
  }

  const getTypeBadgeColor = (type: VendorType) => {
    switch (type) {
      case VendorType.RESTAURANT:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case VendorType.PHARMACY:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case VendorType.GROCERY:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/vendors')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-4">
            {vendor.image ? (
              <img src={vendor.image} alt="Vendor Logo" className="h-16 w-16 rounded-xl object-cover border" />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary border">
                <Store className="h-8 w-8" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {getLocalizedDisplayName(vendor, i18n.language, vendor.name?.en)}
              </h1>
              <p className="text-muted-foreground">{vendor.owner_name}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeBadgeColor(vendor.type)}`}>
              {t(`vendor_type_${vendor.type}`)}
            </span>
            <Badge variant={vendor.is_active ? 'default' : 'secondary'}>
              {vendor.is_active ? t('active') : t('inactive')}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full" dir={i18n.dir()}>
        <TabsList className="mb-6 grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="wallet">{t('wallet')}</TabsTrigger>
          <TabsTrigger value="orders">{t('orders')}</TabsTrigger>
          <TabsTrigger value="products">{t('products')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('contact_info')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span dir="ltr">{vendor.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span>{vendor.email}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <span>{vendor.formatted_address}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('financial_summary')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-muted p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">{t('wallet_balance')}</p>
                  <Money amount={vendor.wallet_balance || 0} className="text-4xl font-bold text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wallet">
          <WalletTransactionsList
            transactions={transactions}
            isLoading={isWalletLoading}
            isError={isWalletError}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            loadMoreRef={loadMoreRef}
          />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersList vendorId={vendor.id} />
        </TabsContent>

        <TabsContent value="products">
          <VendorProductsList vendorId={vendor.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
