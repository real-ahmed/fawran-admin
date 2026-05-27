import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { DeliveryZoneMap } from '@/features/delivery-zones/components/DeliveryZoneMap';
import { getDeliveryZone, createDeliveryZone, updateDeliveryZone } from '@/services/deliveryZoneService';
import type { Coordinate } from '@/types/delivery-zone';

const formSchema = z.object({
  name: z.object({
    en: z.string().min(2, 'Name in English is required'),
    ar: z.string().min(2, 'Name in Arabic is required'),
  }),
  is_active: z.boolean().default(true),
  coordinates: z.array(
    z.object({
      lat: z.number(),
      lng: z.number(),
    })
  ).min(3, 'A delivery zone must have at least 3 coordinates (a polygon).'),
});

type FormData = z.infer<typeof formSchema>;

export const DeliveryZoneFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

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
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[500px]" />
          <Skeleton className="h-[500px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? t('edit_delivery_zone') : t('create_delivery_zone')}
        description={t('delivery_zone_desc')}
        backUrl="/delivery-zones"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">{t('delivery_zone_details')}</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name_en">{t('name_en')} *</Label>
                  <Input id="name_en" {...register('name.en')} />
                  {errors.name?.en && <p className="text-sm text-destructive">{errors.name.en.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name_ar">{t('name_ar')} *</Label>
                  <Input id="name_ar" {...register('name.ar')} />
                  {errors.name?.ar && <p className="text-sm text-destructive">{errors.name.ar.message}</p>}
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_active">{t('status')}</Label>
                    <p className="text-sm text-muted-foreground">{t('status_desc')}</p>
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
            </div>
            
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/delivery-zones')}
                disabled={mutation.isPending}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="gap-2">
                <Save className="h-4 w-4" />
                {t('save')}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">{t('map_area')}</h2>
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
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
