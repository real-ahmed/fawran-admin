import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  description?: string;
  backUrl?: string;
  children?: ReactNode;
}

export const PageHeader = ({ title, description, backUrl, children }: PageHeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {(backUrl || children) && (
        <div className="flex items-center gap-2">
          {backUrl && (
            <Button variant="outline" onClick={() => navigate(backUrl)} className="gap-2">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t('back')}
            </Button>
          )}
          {children}
        </div>
      )}
    </div>
  );
};
