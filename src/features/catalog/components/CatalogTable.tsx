import { CheckCircle2, Edit2, Package, Trash2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Can } from '@/components/Can';
import { DataTableSkeletonRows } from '@/components/DataTableSkeletonRows';
import { TableActionButton } from '@/components/TableActionButton';
import type { PermissionRequirement } from '@/utils/access';
import type { CatalogApprovalStatus } from '@/types/catalog';

export interface CatalogTableColumn<TItem> {
  key: string;
  header: string;
  render: (item: TItem) => React.ReactNode;
  className?: string;
}

interface CatalogTableProps<TItem extends { id: number; is_active?: boolean }> {
  items: TItem[];
  columns: CatalogTableColumn<TItem>[];
  isLoading: boolean;
  isDeleting: boolean;
  approvalStatus: CatalogApprovalStatus;
  hasNextPage?: boolean;
  loadMoreRef: (node?: Element | null) => void;
  emptyTitle: string;
  updatePermission: PermissionRequirement;
  deletePermission: PermissionRequirement;
  approvePermission: PermissionRequirement;
  onEdit: (item: TItem) => void;
  onDelete: (id: number) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export const CatalogTable = <TItem extends { id: number; is_active?: boolean }>({
  items,
  columns,
  isLoading,
  isDeleting,
  approvalStatus,
  hasNextPage,
  loadMoreRef,
  emptyTitle,
  updatePermission,
  deletePermission,
  approvePermission,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}: CatalogTableProps<TItem>) => {
  const { t } = useTranslation();
  const canReview = approvalStatus === 'pending';

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              <TableHead>{t('status')}</TableHead>
              <TableHead className="w-[180px] text-end">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <DataTableSkeletonRows columns={[...columns.map(() => 'w-36'), 'w-20', 'w-36']} />
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Package className="mb-2 h-8 w-8 opacity-20" />
                    <p>{emptyTitle}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render(item)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                      {item.is_active ? t('active') : t('inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-2">
                      {canReview && (
                        <Can permission={approvePermission}>
                          <TableActionButton label={t('approve')} icon={CheckCircle2} onClick={() => onApprove(item.id)} />
                          <TableActionButton label={t('reject')} icon={XCircle} onClick={() => onReject(item.id)} tone="destructive" />
                        </Can>
                      )}
                      <Can permission={updatePermission}>
                        <TableActionButton label={t('edit')} icon={Edit2} onClick={() => onEdit(item)} />
                      </Can>
                      <Can permission={deletePermission}>
                        <TableActionButton
                          label={t('delete')}
                          icon={Trash2}
                          onClick={() => onDelete(item.id)}
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
                columns={[...columns.map(() => 'w-36'), 'w-20', 'w-36']}
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
