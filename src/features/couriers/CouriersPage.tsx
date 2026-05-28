import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApprovalStatus } from '@/types/enums';
import { CouriersList } from './components/CouriersList';

export const CouriersPage = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('couriers')}
        description={t('couriers_description')}
      />

      <Tabs defaultValue={ApprovalStatus.Pending} className="w-full" dir={i18n.dir()}>
        <TabsList className="grid w-full max-w-[540px] grid-cols-3 p-1 bg-muted/50 rounded-lg mb-6">
          <TabsTrigger value={ApprovalStatus.Pending} className="py-2.5 rounded-md">{t('pending_couriers')}</TabsTrigger>
          <TabsTrigger value="all" className="py-2.5 rounded-md">{t('all_couriers')}</TabsTrigger>
          <TabsTrigger value={ApprovalStatus.Rejected} className="py-2.5 rounded-md">{t('rejected_couriers')}</TabsTrigger>
        </TabsList>

        <TabsContent value={ApprovalStatus.Pending} className="mt-0 outline-none">
          <CouriersList approvalStatus={ApprovalStatus.Pending} />
        </TabsContent>

        <TabsContent value="all" className="mt-0 outline-none">
          <CouriersList approvalStatus={ApprovalStatus.Approved} />
        </TabsContent>

        <TabsContent value={ApprovalStatus.Rejected} className="mt-0 outline-none">
          <CouriersList approvalStatus={ApprovalStatus.Rejected} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
