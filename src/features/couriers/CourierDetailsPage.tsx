import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, ArrowLeft, Bike, CarFront, IdCard, CheckCircle2, XCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Money } from '@/components/Money';
import { useCourier } from './hooks/useCourier';
import { useCourierWalletTransactions } from './hooks/useCourierWalletTransactions';
import { OrdersList } from '@/features/orders/components/OrdersList';
import { WalletTransactionsList } from '@/components/WalletTransactionsList';
import { VehicleType, ApprovalStatus } from '@/types/enums';

export const CourierDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { data: courier, isLoading, isError } = useCourier(Number(id));
  const {
    transactions,
    isLoading: isWalletLoading,
    isError: isWalletError,
    hasNextPage,
    isFetchingNextPage,
    loadMoreRef
  } = useCourierWalletTransactions(Number(id));

  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !courier) {
    return (
      <div className="py-10 text-center text-destructive">
        {t('error_loading_courier')}
      </div>
    );
  }

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case VehicleType.Motorcycle:
      case VehicleType.Bicycle:
        return <Bike className="h-6 w-6" />;
      case VehicleType.Car:
      default:
        return <CarFront className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/couriers')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{courier.user?.name}</h1>
            <p className="text-muted-foreground">{courier.user?.phone}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-secondary text-secondary-foreground">
              {t(`vehicle_${courier.vehicle_type}`)}
            </span>
            {courier.is_approved ? (
              <Badge variant={courier.is_online ? 'default' : 'secondary'}>
                {courier.is_online ? t('online') : t('offline')}
              </Badge>
            ) : courier.rejected_at ? (
              <Badge variant="destructive">{t('rejected')}</Badge>
            ) : (
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                {t('pending')}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full" dir={i18n.dir()}>
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="wallet">{t('wallet')}</TabsTrigger>
          <TabsTrigger value="orders">{t('orders')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('general_info')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('national_id')}</p>
                    <p className="font-medium">{courier.national_id || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('plate_number')}</p>
                    <p className="font-medium">{courier.plate_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('vehicle_type')}</p>
                    <p className="font-medium flex items-center gap-2">
                      {getVehicleIcon(courier.vehicle_type)}
                      {t(`vehicle_${courier.vehicle_type}`)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('joined_at')}</p>
                    <p className="font-medium">
                      {new Date(courier.created_at).toLocaleDateString()}
                    </p>
                  </div>
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
                  <Money amount={courier.wallet_balance || 0} className="text-4xl font-bold text-primary" />
                </div>
              </CardContent>
            </Card>

            {courier.document && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>{t('documents')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courier.document.contract_number && (
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <IdCard className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{t('contract_number')}</p>
                            <p className="text-sm text-muted-foreground">{courier.document.contract_number}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {courier.document.criminal_record_file && (
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          <div>
                            <p className="font-medium">{t('criminal_record')}</p>
                            <p className="text-sm text-muted-foreground">{t('uploaded')}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => window.open(courier.document?.criminal_record_file, '_blank')}>
                          {t('view')}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
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
          <OrdersList courierId={courier.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
