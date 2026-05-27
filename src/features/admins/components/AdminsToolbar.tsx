import { Search, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Can } from '@/components/Can';
import { PERMISSIONS } from '@/config/permissions';

interface AdminsToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const AdminsToolbar = ({ searchTerm, onSearchChange }: AdminsToolbarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="ps-9"
            placeholder={t('search_admins')}
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <Can permission={PERMISSIONS.VIEW_ROLES}>
          <Button variant="outline" className="gap-2" onClick={() => navigate('/roles')}>
            <ShieldCheck className="h-4 w-4" />
            {t('roles')}
          </Button>
        </Can>
      </div>
    </div>
  );
};
