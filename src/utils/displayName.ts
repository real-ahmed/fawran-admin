interface LocalizedDisplayName {
  ar?: string;
  en?: string;
}

interface DisplayNameSource {
  name?: string | LocalizedDisplayName;
  display_name?: LocalizedDisplayName;
}

const getLocalizedValue = (value: string | LocalizedDisplayName | undefined, locale: 'ar' | 'en') => {
  if (!value) return '';
  if (typeof value === 'string') return value;

  return value[locale] || value.en || value.ar || '';
};

export const getLocalizedDisplayName = (
  source: DisplayNameSource,
  language: string,
  fallback = ''
) => {
  const locale = language.startsWith('ar') ? 'ar' : 'en';

  return (
    getLocalizedValue(source.display_name, locale) ||
    getLocalizedValue(source.name, locale) ||
    fallback
  );
};
