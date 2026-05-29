import { Edit2, MoreHorizontal, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
}

export const ActionMenu = ({
  onEdit,
  onDelete,
  disabled,
  showEdit = true,
  showDelete = true,
}: ActionMenuProps) => {
  const { t } = useTranslation();

  if (!showEdit && !showDelete) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          aria-label={t('actions')}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {showEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
            {t('edit')}
          </DropdownMenuItem>
        )}
        {showDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            {t('delete')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
