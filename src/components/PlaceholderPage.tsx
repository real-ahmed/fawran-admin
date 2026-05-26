import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PlaceholderPageProps {
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
}

export const PlaceholderPage = ({ titleKey, descriptionKey, icon: Icon }: PlaceholderPageProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h1 className="text-lg font-semibold text-foreground">{t(titleKey)}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t(descriptionKey)}</p>
    </div>
  );
};
