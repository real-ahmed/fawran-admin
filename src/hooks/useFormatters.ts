import { useTranslation } from 'react-i18next';
import { useAppConfig } from '@/hooks/useAppConfig';

/**
 * Provides locale-aware number and currency formatters.
 * Use throughout the app to ensure consistent formatting in Arabic and English.
 *
 * Usage:
 *   const { formatNumber, formatCurrency } = useFormatters();
 *   formatNumber(1234)       → "1,234"  (en) | "١٬٢٣٤"  (ar)
 *   formatCurrency(99.5)     → "EGP 99.50"   | "٩٩٫٥٠ ج.م.‏"
 */
export const useFormatters = () => {
  const { i18n } = useTranslation();
  const { currency } = useAppConfig();

  const locale = i18n.language.startsWith('ar') ? 'ar-EG' : 'en-US';

  const formatNumber = (value: number | string, options?: Intl.NumberFormatOptions) =>
    new Intl.NumberFormat(locale, options).format(Number(value));

  const formatCurrency = (value: number | string) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(value));

  const formatPercent = (value: number | string) =>
    new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(Number(value) / 100);

  return { formatNumber, formatCurrency, formatPercent, locale };
};
