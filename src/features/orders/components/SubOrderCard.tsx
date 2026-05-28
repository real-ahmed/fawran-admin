import { useTranslation } from 'react-i18next';
import { SubOrder } from '@/types/order';
import { Store, ReceiptText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Money } from '@/components/Money';

interface SubOrderCardProps {
  subOrder: SubOrder;
}

export const SubOrderCard = ({ subOrder }: SubOrderCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 py-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            {subOrder.vendor_name}
          </CardTitle>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{t(`sub_order_status.${subOrder.status}`)}</span>
            <Money amount={subOrder.sub_total} className="font-semibold" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-transparent hover:bg-transparent">
              <TableHead className="w-[40%]">{t('item')}</TableHead>
              <TableHead>{t('qty')}</TableHead>
              <TableHead>{t('unit_price')}</TableHead>
              <TableHead className="text-end">{t('total')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subOrder.items.map(item => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-medium">{item.name}</div>
                  {item.options && item.options.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      {item.options.map((opt, idx) => (
                        <div key={idx}>
                          + {opt.option}: {opt.value}{' '}
                          {opt.additional_price !== '0.00' && (
                            <span>(<Money amount={opt.additional_price} />)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <div className="text-xs text-amber-600 mt-1 flex items-start gap-1">
                      <ReceiptText className="h-3 w-3 mt-0.5" />
                      <span>{item.notes}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <Money amount={item.unit_price} />
                  {item.options_price !== '0.00' && (
                    <span className="block text-xs text-muted-foreground">
                      + <Money amount={item.options_price} /> {t('options')}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-end font-medium">
                  <Money amount={((parseFloat(item.unit_price) + parseFloat(item.options_price)) * parseInt(item.quantity)).toFixed(2)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
