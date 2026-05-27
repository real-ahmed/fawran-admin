interface LocalizedDisplayName {
  ar?: string;
  en?: string;
}

interface DisplayNameSource {
  name?: string;
  display_name?: LocalizedDisplayName;
}

export const getLocalizedDisplayName = (
  source: DisplayNameSource,
  language: string,
  fallback = ''
) => {
  const locale = language.startsWith('ar') ? 'ar' : 'en';

  return source.display_name?.[locale] || source.display_name?.en || source.name || fallback;
};
