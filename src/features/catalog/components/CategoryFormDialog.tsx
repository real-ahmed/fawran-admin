import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FormFieldError } from '@/components/FormFieldError';
import { applyApiValidationErrors, parseApiError } from '@/utils/api';
import { createCategory, updateCategory } from '@/services/catalog/categoryService';
import type { Category, CategoryPayload } from '@/types/catalog';
import { localizedName } from '../utils';
import { ImageUploader } from '@/components/ImageUploader';
import { SearchableSelect } from '@/components/SearchableSelect';
import { useCategoryParentOptions } from '../hooks/useCategoryParentOptions';

interface CategoryFormDialogProps {
  category: Category | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

interface CategoryFormValues {
  name_en: string;
  name_ar: string;
  parent_category_id: string;
  icon?: FileList | null;
  is_active: boolean;
  image?: FileList | null;
}

export const CategoryFormDialog = ({ category, categories, isOpen, onClose }: CategoryFormDialogProps) => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const {
    categories: parentOptions,
    searchTerm: parentSearchTerm,
    setSearchTerm: setParentSearchTerm,
    isLoading: parentsLoading,
    isFetchingNextPage: parentsFetchingNextPage,
    hasNextPage: parentsHasNextPage,
    loadMoreRef: parentsLoadMoreRef,
  } = useCategoryParentOptions({
    enabled: isOpen,
    excludedCategoryId: category?.id,
    fallbackCategories: categories,
  });
  const schema = z.object({
    name_en: z.string().min(1, t('validation_required')),
    name_ar: z.string().min(1, t('validation_required')),
    parent_category_id: z.string(),
    icon: z.any().optional(),
    is_active: z.boolean(),
    image: z.any().optional(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name_en: '',
      name_ar: '',
      parent_category_id: 'none',
      icon: null,
      is_active: true,
      image: null,
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    reset({
      name_en: category?.name?.en || '',
      name_ar: category?.name?.ar || '',
      parent_category_id: category?.parent_category_id ? String(category.parent_category_id) : 'none',
      icon: null,
      is_active: category?.is_active ?? true,
      image: null,
    });
  }, [category, isOpen, reset]);

  const mutation = useMutation({
    mutationFn: (payload: CategoryPayload) => category ? updateCategory(category.id, payload) : createCategory(payload),
    onSuccess: () => {
      toast.success(t('saved'));
      queryClient.invalidateQueries({ queryKey: ['catalog', 'categories'] });
      onClose();
    },
    onError: (error) => {
      applyApiValidationErrors<CategoryFormValues>(error, setError, {
        'name.en': 'name_en',
        'name.ar': 'name_ar',
        parent_category_id: 'parent_category_id',
        icon: 'icon',
      });
      toast.error(parseApiError(error, t('save_failed')));
    },
  });

  const onSubmit = (values: CategoryFormValues) => {
    mutation.mutate({
      name: {
        en: values.name_en,
        ar: values.name_ar,
      },
      is_active: values.is_active,
      parent_category_id: values.parent_category_id === 'none' ? null : Number(values.parent_category_id),
      icon: values.icon?.length ? values.icon : null,
      image: values.image?.length ? values.image : null,
    });
  };

  const parentCategoryOptions = [
    { value: 'none', label: t('no_parent_category') },
    ...(category?.parent && !parentOptions.some((option) => option.id === category.parent?.id)
      ? [{
          value: String(category.parent.id),
          label: localizedName(category.parent.name, i18n.language),
        }]
      : []),
    ...parentOptions.map((option) => ({
      value: String(option.id),
      label: localizedName(option.name, i18n.language),
    })),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? t('edit_category') : t('create_category')}</DialogTitle>
          <DialogDescription>{t('category_form_desc')}</DialogDescription>
        </DialogHeader>

        <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
             <Label>{t('category_image')}</Label>
             <ImageUploader
                id="category-image"
                registration={register('image')}
                previewUrl={category?.image || undefined}
                className="w-32 h-32"
             />
             <FormFieldError message={errors.image?.message as string} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category-name-en">{t('name_en')}</Label>
              <Input id="category-name-en" {...register('name_en')} />
              <FormFieldError message={errors.name_en?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-name-ar">{t('name_ar')}</Label>
              <Input id="category-name-ar" {...register('name_ar')} dir="rtl" />
              <FormFieldError message={errors.name_ar?.message} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
	            <div className="space-y-2">
	              <Label>{t('parent_category')}</Label>
	              <SearchableSelect
	                value={watch('parent_category_id')}
	                options={parentCategoryOptions}
	                onChange={(value) => setValue('parent_category_id', value)}
	                placeholder={t('parent_category')}
	                searchPlaceholder={t('search_categories')}
	                searchTerm={parentSearchTerm}
	                onSearchChange={setParentSearchTerm}
	                isLoading={parentsLoading}
	                isFetchingNextPage={parentsFetchingNextPage}
	                hasNextPage={Boolean(parentsHasNextPage)}
	                loadMoreRef={parentsLoadMoreRef}
	              />
	              <FormFieldError message={errors.parent_category_id?.message} />
	            </div>
            <div className="space-y-2">
              <Label>{t('category_icon')}</Label>
              <ImageUploader
                 id="category-icon"
                 registration={register('icon')}
                 previewUrl={category?.icon || undefined}
                 className="w-32 h-32"
                 accept=".svg, image/svg+xml"
              />
              <FormFieldError message={errors.icon?.message as string} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="category-active">{t('active')}</Label>
            <Switch
              id="category-active"
              checked={watch('is_active')}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="category-form" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
