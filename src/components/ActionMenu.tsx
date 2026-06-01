import { Edit2, MoreHorizontal, Trash2, User } from 'lucide-react';
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
  onView?: () => void;
  disabled?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showView?: boolean;
}

export const ActionMenu = ({
  onEdit,
  onDelete,
  onView,
  disabled,
  showEdit = true,
  showDelete = true,
  showView = false,
}: ActionMenuProps) => {
  const { t } = useTranslation();

  if (!showEdit && !showDelete && !showView) {
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
        {showView && onView && (
          <DropdownMenuItem onClick={onView}>
            <User className="h-4 w-4" />
            {t('view_profile')}
          </DropdownMenuItem>
        )}
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
