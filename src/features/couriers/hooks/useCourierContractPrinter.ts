import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getCourierContractPrintHtml } from '@/services/courierService';

interface UseCourierContractPrinterOptions {
  onPrinted?: (courierId: number) => Promise<void> | void;
}

export const useCourierContractPrinter = ({ onPrinted }: UseCourierContractPrinterOptions = {}) => {
  const { t } = useTranslation();

  const printCourierContract = useCallback(async (courierId: number) => {
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      toast.error(t('popup_blocked'));
      return;
    }

    try {
      const contractHtml = await getCourierContractPrintHtml(courierId);
      printWindow.document.write(contractHtml);
      printWindow.document.close();
      await onPrinted?.(courierId);
    } catch (error) {
      printWindow.close();
      toast.error(t('error_printing'));
    }
  }, [onPrinted, t]);

  return { printCourierContract };
};
