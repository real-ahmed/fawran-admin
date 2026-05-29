type LocaleCode = 'ar' | 'en';
export type LocalizedText = Partial<Record<LocaleCode, string>>;

export const getLocaleCode = (language: string): LocaleCode =>
  language.startsWith('ar') ? 'ar' : 'en';

export const parseLocalizedText = (value?: string | null): LocalizedText => {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value) as unknown;

    if (parsed && typeof parsed === 'object') {
      const localized = parsed as Record<string, unknown>;

      return {
        ar: typeof localized.ar === 'string' ? localized.ar : '',
        en: typeof localized.en === 'string' ? localized.en : '',
      };
    }
  } catch {
    return { en: value };
  }

  return { en: value };
};

export const getLocalizedText = (
  value: string | null | undefined,
  language: string,
  fallback: string
) => {
  const localized = parseLocalizedText(value);
  const locale = getLocaleCode(language);

  return localized[locale] || localized.en || localized.ar || fallback;
};
