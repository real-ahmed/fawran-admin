import type { LocalizedValue, MasterProduct } from '@/types/catalog';

export const localizedName = (value: LocalizedValue | string | null | undefined, language: string, fallback = '-') => {
  if (!value) return fallback;
  if (typeof value === 'string') return value || fallback;

  const locale = language.startsWith('ar') ? 'ar' : 'en';
  return value[locale] || value.en || value.ar || fallback;
};

export const productDescription = (product: MasterProduct, language: string) =>
  localizedName(product.description, language, '');
