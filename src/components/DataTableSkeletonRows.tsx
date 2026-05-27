import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/utils';

interface DataTableSkeletonRowsProps {
  columns: string[];
  rows?: number;
  loadMoreRef?: (node?: Element | null) => void;
}

export const DataTableSkeletonRows = ({ columns, rows = 5, loadMoreRef }: DataTableSkeletonRowsProps) => (
  <>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <TableRow
        key={rowIndex}
        ref={rowIndex === rows - 1 ? loadMoreRef : undefined}
        className="hover:bg-transparent"
      >
        {columns.map((widthClass, columnIndex) => (
          <TableCell key={`${rowIndex}-${columnIndex}`}>
            <Skeleton
              className={cn(
                'h-4',
                widthClass,
                columnIndex === columns.length - 1 && 'ms-auto'
              )}
            />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);
