import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { PageHeader } from '@/components/PageHeader';
import { FormFieldError } from '@/components/FormFieldError';
import { FormPageSkeleton } from '@/components/FormPageSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DeliveryZoneMap } from '@/features/delivery-zones/components/DeliveryZoneMap';
import { getDeliveryZone, createDeliveryZone, updateDeliveryZone } from '@/services/deliveryZoneService';
import type { Coordinate } from '@/types/delivery-zone';

interface FormData {
  name: {
    en: string;
    ar: string;
  };
  is_active: boolean;
  coordinates: Coordinate[];
}

export const DeliveryZoneFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);
  const formSchema = z.object({
    name: z.object({
      en: z.string().min(2, t('validation_min_chars', { count: 2 })),
      ar: z.string().min(2, t('validation_min_chars', { count: 2 })),
    }),
    is_active: z.boolean().default(true),
    coordinates: z.array(
      z.object({
        lat: z.number(),
        lng: z.number(),
      })
    ).min(3, t('delivery_zone_polygon_required')),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: { en: '', ar: '' },
      is_active: true,
      coordinates: [],
    },
  });

  const { data: zone, isLoading: isFetching } = useQuery({
    queryKey: ['delivery-zones', id],
    queryFn: () => getDeliveryZone(id as string),
    enabled: isEditing,
  });

  useEffect(() => {
    if (zone && isEditing) {
      reset({
        name: {
          en: (zone.name as any)?.en || '',
          ar: (zone.name as any)?.ar || '',
        },
        is_active: zone.is_active,
        coordinates: zone.coordinates,
      });
    }
  }, [zone, isEditing, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEditing ? updateDeliveryZone(id as string, data) : createDeliveryZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-zones'] });
      toast.success(isEditing ? t('updated_successfully') : t('created_successfully'));
      navigate('/delivery-zones');
    },
    onError: () => {
      toast.error(t('error_saving'));
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  if (isEditing && isFetching) {
    return <FormPageSkeleton showMapPanel />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? t('edit_delivery_zone') : t('create_delivery_zone')}
        description={t('delivery_zone_desc')}
        backUrl="/delivery-zones"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border bg-card shadow-sm">
        <section className="space-y-5 border-b border-border p-6 sm:p-8">
          <div>
            <h2 className="text-base font-semibold text-foreground">{t('delivery_zone_details')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('delivery_zone_desc')}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="name_en" className="text-sm font-medium">
                {t('name_en')} <span className="text-destructive">*</span>
              </Label>
              <Input id="name_en" {...register('name.en')} className="h-11 w-full bg-muted/40" dir="ltr" />
              <FormFieldError message={errors.name?.en?.message} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name_ar" className="text-sm font-medium">
                {t('name_ar')} <span className="text-destructive">*</span>
              </Label>
              <Input id="name_ar" {...register('name.ar')} className="h-11 w-full bg-muted/40" dir="rtl" />
              <FormFieldError message={errors.name?.ar?.message} />
            </div>

            <div className="flex min-h-11 items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/10 px-4 py-3">
              <div className="space-y-0.5">
                <Label htmlFor="is_active" className="text-sm font-medium">{t('status')}</Label>
                <p className="text-xs text-muted-foreground">{t('status_desc')}</p>
              </div>
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <Switch
                    id="is_active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
        </section>

        <section className="space-y-5 border-b border-border p-6 sm:p-8">
          <div>
            <h2 className="text-base font-semibold text-foreground">{t('map_area')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('draw_polygon_instruction')}</p>
          </div>
          <Controller
            control={control}
            name="coordinates"
            render={({ field }) => (
              <DeliveryZoneMap
                coordinates={field.value}
                onChange={field.onChange}
                error={errors.coordinates?.message}
              />
            )}
          />
        </section>

        <div className="flex justify-end gap-3 px-6 py-5 sm:px-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/delivery-zones')}
            disabled={mutation.isPending}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={mutation.isPending} className="gap-2">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t('save')}
          </Button>
        </div>
      </form>
    </div>
  );
};
