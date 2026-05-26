import { Plus, Search, ShieldCheck, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/PageHeader';

export const AdminsList = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader title={t('admins')} description={t('admins_desc')}>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t('add_admin')}
        </Button>
      </PageHeader>

      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="ps-9" placeholder={t('search_admins')} />
          </div>
          <Button variant="outline" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            {t('roles')}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Users className="h-6 w-6" />
        </div>
        <h2 className="text-base font-semibold text-foreground">{t('admins_empty_title')}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t('admins_empty_desc')}</p>
      </div>
    </div>
  );
};
