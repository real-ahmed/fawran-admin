import { Edit2, MapPinned, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/Can';
import { DataTableSkeletonRows } from '@/components/DataTableSkeletonRows';
import { TableActionButton } from '@/components/TableActionButton';
import { PERMISSIONS } from '@/config/permissions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DeliveryZone } from '@/types/delivery-zone';

interface DeliveryZonesTableProps {
  zones: DeliveryZone[];
  isLoading: boolean;
  hasNextPage?: boolean;
  isDeleting: boolean;
  loadMoreRef: (node?: Element | null) => void;
  onEdit: (zone: DeliveryZone) => void;
  onDelete: (id: string) => void;
}

export const DeliveryZonesTable = ({
  zones,
  isLoading,
  hasNextPage,
  isDeleting,
  loadMoreRef,
  onEdit,
  onDelete,
}: DeliveryZonesTableProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith('ar');

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[90px]">#</TableHead>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="w-[100px] text-end">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <DataTableSkeletonRows columns={['w-8', 'w-40', 'w-20', 'w-24']} />
            ) : zones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <MapPinned className="mb-2 h-8 w-8 opacity-20" />
                    <p>{t('delivery_zones_empty_title')}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium text-muted-foreground">{zone.id}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    {isArabic ? zone.name?.ar : zone.name?.en}
                  </TableCell>
                  <TableCell>
                    <Badge variant={zone.is_active ? 'default' : 'secondary'}>
                      {zone.is_active ? t('active') : t('inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-2">
                      <Can permission={PERMISSIONS.UPDATE_DELIVERY_ZONES}>
                        <TableActionButton label={t('edit')} icon={Edit2} onClick={() => onEdit(zone)} />
                      </Can>
                      <Can permission={PERMISSIONS.DELETE_DELIVERY_ZONES}>
                        <TableActionButton
                          label={t('delete')}
                          icon={Trash2}
                          onClick={() => onDelete(zone.id)}
                          disabled={isDeleting}
                          tone="destructive"
                        />
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
            {hasNextPage && (
              <DataTableSkeletonRows
                columns={['w-8', 'w-40', 'w-20', 'w-24']}
                rows={1}
                loadMoreRef={loadMoreRef}
              />
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
