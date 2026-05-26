import { useTranslation } from 'react-i18next';
import { useAppConfig } from '@/hooks/useAppConfig';

interface MoneyProps {
  amount: number | string;
  /** Override the currency code (default: from app config) */
  currencyOverride?: string;
  className?: string;
}

/**
 * Displays a monetary value formatted to the current locale and app currency.
 *
 * Usage:
 *   <Money amount={1234.5} />
 *   <Money amount={vendor.balance} className="text-green-600 font-bold" />
 */
export const Money = ({ amount, currencyOverride, className }: MoneyProps) => {
  const { i18n } = useTranslation();
  const { currency } = useAppConfig();

  const resolved = currencyOverride || currency || 'SAR';
  const locale = i18n.language.startsWith('ar') ? 'ar-EG' : 'en-US';

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: resolved,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount));

  return <span className={className}>{formatted}</span>;
};
