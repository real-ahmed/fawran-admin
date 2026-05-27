import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CouriersList } from './components/CouriersList';

export const CouriersPage = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('couriers')}
        description={t('couriers_description')}
      />

      <Tabs defaultValue="pending" className="w-full" dir={i18n.dir()}>
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 p-1 bg-muted/50 rounded-lg mb-6">
          <TabsTrigger value="pending" className="py-2.5 rounded-md">{t('pending_couriers')}</TabsTrigger>
          <TabsTrigger value="all" className="py-2.5 rounded-md">{t('all_couriers')}</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-0 outline-none">
          <CouriersList approvalStatus="pending" />
        </TabsContent>

        <TabsContent value="all" className="mt-0 outline-none">
          <CouriersList approvalStatus="approved" />
        </TabsContent>
      </Tabs>
    </div>
  );
};
