import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ShoppingBag, Smartphone, Laptop, Pizza, Coffee, Car, Home, Gift, Shirt, Watch, Bike, Briefcase, Camera, Music, Book, Heart, Star, Tag, Monitor, Speaker } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FormFieldError } from '@/components/FormFieldError';
import { applyApiValidationErrors, parseApiError } from '@/utils/api';
import { createCategory, updateCategory } from '@/services/catalog/categoryService';
import type { Category, CategoryPayload } from '@/types/catalog';
import { localizedName } from '../utils';
import { ImageUploader } from '@/components/ImageUploader';

const CATEGORY_ICONS = [
  { id: 'shopping-bag', icon: ShoppingBag, label: 'Shopping Bag' },
  { id: 'smartphone', icon: Smartphone, label: 'Smartphone' },
  { id: 'laptop', icon: Laptop, label: 'Laptop' },
  { id: 'pizza', icon: Pizza, label: 'Food/Pizza' },
  { id: 'coffee', icon: Coffee, label: 'Coffee' },
  { id: 'car', icon: Car, label: 'Car' },
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'gift', icon: Gift, label: 'Gift' },
  { id: 'shirt', icon: Shirt, label: 'Clothing' },
  { id: 'watch', icon: Watch, label: 'Watch' },
  { id: 'bike', icon: Bike, label: 'Bike' },
  { id: 'briefcase', icon: Briefcase, label: 'Briefcase' },
  { id: 'camera', icon: Camera, label: 'Camera' },
  { id: 'music', icon: Music, label: 'Music' },
  { id: 'book', icon: Book, label: 'Book' },
  { id: 'heart', icon: Heart, label: 'Heart' },
  { id: 'star', icon: Star, label: 'Star' },
  { id: 'tag', icon: Tag, label: 'Tag' },
  { id: 'monitor', icon: Monitor, label: 'Monitor' },
  { id: 'speaker', icon: Speaker, label: 'Electronics' },
];

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
  icon_class: string;
  is_active: boolean;
  image?: FileList | null;
}

export const CategoryFormDialog = ({ category, categories, isOpen, onClose }: CategoryFormDialogProps) => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const schema = z.object({
    name_en: z.string().min(1, t('validation_required')),
    name_ar: z.string().min(1, t('validation_required')),
    parent_category_id: z.string(),
    icon_class: z.string(),
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
      icon_class: '',
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
      icon_class: category?.icon_class || '',
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
        icon_class: 'icon_class',
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
      icon_class: values.icon_class || null,
      image: values.image?.length ? values.image : null,
    });
  };

  const parentOptions = categories.filter((option) => option.id !== category?.id);

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
              <Select value={watch('parent_category_id')} onValueChange={(value) => setValue('parent_category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('parent_category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('no_parent_category')}</SelectItem>
                  {parentOptions.map((option) => (
                    <SelectItem key={option.id} value={String(option.id)}>
                      {localizedName(option.name, i18n.language)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormFieldError message={errors.parent_category_id?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-icon">{t('icon_class')}</Label>
              <Select value={watch('icon_class')} onValueChange={(value) => setValue('icon_class', value)}>
                <SelectTrigger id="category-icon">
                  <SelectValue placeholder={t('select_icon')} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="none">{t('none')}</SelectItem>
                  {CATEGORY_ICONS.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <SelectItem key={item.id} value={item.id}>
                        <div className="flex items-center gap-2">
                          <IconComp className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormFieldError message={errors.icon_class?.message} />
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
