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
import { createBrand, updateBrand } from '@/services/catalog/brandService';
import type { Brand, BrandPayload } from '@/types/catalog';
import { ImageUploader } from '@/components/ImageUploader';

interface BrandFormDialogProps {
  brand: Brand | null;
  isOpen: boolean;
  onClose: () => void;
}

interface BrandFormValues {
  name_en: string;
  name_ar: string;
  is_active: boolean;
  image?: FileList | null;
}

export const BrandFormDialog = ({ brand, isOpen, onClose }: BrandFormDialogProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const schema = z.object({
    name_en: z.string().min(1, t('validation_required')),
    name_ar: z.string().min(1, t('validation_required')),
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
  } = useForm<BrandFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name_en: '',
      name_ar: '',
      is_active: true,
      image: null,
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    reset({
      name_en: brand?.name?.en || '',
      name_ar: brand?.name?.ar || '',
      is_active: brand?.is_active ?? true,
      image: null,
    });
  }, [brand, isOpen, reset]);

  const mutation = useMutation({
    mutationFn: (payload: BrandPayload) => brand ? updateBrand(brand.id, payload) : createBrand(payload),
    onSuccess: () => {
      toast.success(t('saved'));
      queryClient.invalidateQueries({ queryKey: ['catalog', 'brands'] });
      onClose();
    },
    onError: (error) => {
      applyApiValidationErrors<BrandFormValues>(error, setError, {
        'name.en': 'name_en',
        'name.ar': 'name_ar',
      });
      toast.error(parseApiError(error, t('save_failed')));
    },
  });

  const onSubmit = (values: BrandFormValues) => {
    mutation.mutate({
      name: {
        en: values.name_en,
        ar: values.name_ar,
      },
      is_active: values.is_active,
      image: values.image?.length ? values.image : null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{brand ? t('edit_brand') : t('create_brand')}</DialogTitle>
          <DialogDescription>{t('brand_form_desc')}</DialogDescription>
        </DialogHeader>

        <form id="brand-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
             <Label>{t('brand_image')}</Label>
             <ImageUploader
                id="brand-image"
                registration={register('image')}
                previewUrl={brand?.image || undefined}
                className="w-32 h-32"
             />
             <FormFieldError message={errors.image?.message as string} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brand-name-en">{t('name_en')}</Label>
              <Input id="brand-name-en" {...register('name_en')} />
              <FormFieldError message={errors.name_en?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-name-ar">{t('name_ar')}</Label>
              <Input id="brand-name-ar" {...register('name_ar')} dir="rtl" />
              <FormFieldError message={errors.name_ar?.message} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="brand-active">{t('active')}</Label>
            <Switch
              id="brand-active"
              checked={watch('is_active')}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="brand-form" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
