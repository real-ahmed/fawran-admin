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
import type { Coordinate, VehicleFee } from '@/types/delivery-zone';
import { VehicleType } from '@/types/enums';

interface FormData {
  name: {
    en: string;
    ar: string;
  };
  is_active: boolean;
  coordinates: Coordinate[];
  vehicle_fees: VehicleFee[];
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
    vehicle_fees: z.array(z.object({
      vehicle_type: z.enum(['car', 'motorcycle', 'bicycle']),
      base_delivery_fee: z.coerce.number().min(0),
      fee_per_km: z.coerce.number().min(0),
      intra_zone_flat_fee: z.union([z.coerce.number().min(0), z.literal('')]).optional().transform(v => v === '' ? undefined : Number(v)),
    })).optional(),
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
      vehicle_fees: [
        { vehicle_type: VehicleType.Car, base_delivery_fee: 0, fee_per_km: 0, intra_zone_flat_fee: undefined },
        { vehicle_type: VehicleType.Motorcycle, base_delivery_fee: 0, fee_per_km: 0, intra_zone_flat_fee: undefined },
        { vehicle_type: VehicleType.Bicycle, base_delivery_fee: 0, fee_per_km: 0, intra_zone_flat_fee: undefined },
      ],
    },
  });

  const { data: zone, isLoading: isFetching } = useQuery({
    queryKey: ['delivery-zones', id],
    queryFn: () => getDeliveryZone(id as string),
    enabled: isEditing,
  });

  useEffect(() => {
    if (zone && isEditing) {
      let parsedCoordinates: Coordinate[] = [];

      // Check if backend returned GeoJSON geometry
      if (zone.geometry && zone.geometry.type === 'Polygon' && zone.geometry.coordinates) {
        const polyCoords = zone.geometry.coordinates[0] || [];
        parsedCoordinates = polyCoords.map((coord: number[]) => ({
          lng: coord[0],
          lat: coord[1],
        }));
      } else if (zone.coordinates) {
        // Fallback in case coordinates exists (either as string or array)
        try {
          parsedCoordinates = typeof zone.coordinates === 'string'
            ? JSON.parse(zone.coordinates)
            : zone.coordinates;
        } catch (e) {
          console.error('Failed to parse coordinates', e);
        }
      }

      let initialFees = [
        { vehicle_type: VehicleType.Car, base_delivery_fee: 0, fee_per_km: 0, intra_zone_flat_fee: undefined },
        { vehicle_type: VehicleType.Motorcycle, base_delivery_fee: 0, fee_per_km: 0, intra_zone_flat_fee: undefined },
        { vehicle_type: VehicleType.Bicycle, base_delivery_fee: 0, fee_per_km: 0, intra_zone_flat_fee: undefined },
      ] as VehicleFee[];

      if (zone.vehicle_fees && zone.vehicle_fees.length > 0) {
        initialFees = initialFees.map(fee => {
          const matched = zone.vehicle_fees?.find(vf => vf.vehicle_type === fee.vehicle_type);
          return matched ? { ...fee, base_delivery_fee: matched.base_delivery_fee, fee_per_km: matched.fee_per_km, intra_zone_flat_fee: matched.intra_zone_flat_fee } : fee;
        });
      }

      reset({
        name: {
          en: (zone.name as any)?.en || '',
          ar: (zone.name as any)?.ar || '',
        },
        is_active: zone.is_active,
        coordinates: parsedCoordinates,
        vehicle_fees: initialFees,
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

        <section className="space-y-5 border-b border-border p-6 sm:p-8">
          <div>
            <h2 className="text-base font-semibold text-foreground">{t('vehicle_fees')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('vehicle_fees_desc')}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[VehicleType.Car, VehicleType.Motorcycle, VehicleType.Bicycle].map((vt, index) => (
              <div key={vt} className="space-y-4 rounded-lg border border-border p-4 bg-muted/10">
                <h3 className="font-medium capitalize text-sm">{t(`vehicle_${vt}`, vt)}</h3>
                
                <input type="hidden" {...register(`vehicle_fees.${index}.vehicle_type`)} value={vt} />
                
                <div className="grid gap-2">
                  <Label htmlFor={`fee_base_${vt}`} className="text-sm">{t('base_delivery_fee')}</Label>
                  <Input 
                    id={`fee_base_${vt}`} 
                    type="number" 
                    step="0.01" 
                    {...register(`vehicle_fees.${index}.base_delivery_fee`)} 
                    className="h-9 bg-background" 
                  />
                  <FormFieldError message={errors.vehicle_fees?.[index]?.base_delivery_fee?.message} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`fee_km_${vt}`} className="text-sm">{t('fee_per_km')}</Label>
                  <Input 
                    id={`fee_km_${vt}`} 
                    type="number" 
                    step="0.01" 
                    {...register(`vehicle_fees.${index}.fee_per_km`)} 
                    className="h-9 bg-background" 
                  />
                  <FormFieldError message={errors.vehicle_fees?.[index]?.fee_per_km?.message} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`fee_intra_${vt}`} className="text-sm">{t('intra_zone_flat_fee')}</Label>
                  <Input 
                    id={`fee_intra_${vt}`} 
                    type="number" 
                    step="0.01" 
                    {...register(`vehicle_fees.${index}.intra_zone_flat_fee`)} 
                    className="h-9 bg-background" 
                    placeholder={t('optional')}
                  />
                  <FormFieldError message={errors.vehicle_fees?.[index]?.intra_zone_flat_fee?.message as string} />
                </div>
              </div>
            ))}
          </div>
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
