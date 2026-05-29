import { z } from 'zod';
import type { TFunction } from 'i18next';
import type { Vendor } from '@/types/vendor';
import { VendorStatus, VendorType } from '@/types/vendor';

export interface VendorForm {
  owner_id: number;
  name: {
    en: string;
    ar: string;
  };
  email: string;
  phone: string;
  type: VendorType;
  status: VendorStatus;
  is_active: boolean;
  latitude: number;
  longitude: number;
  formatted_address: string;
  image?: FileList | null;
  working_hours: {
    day_of_week: number;
    open_time: string;
    close_time: string;
  }[];
  delivery_zones: {
    delivery_zone_id: number;
    min_order_amount: number;
    estimated_delivery_time: number;
  }[];
}

export const createVendorFormSchema = (t: TFunction) => z.object({
  owner_id: z.number().min(1, t('validation_required')),
  name: z.object({
    en: z.string().min(2, t('validation_min_chars', { count: 2 })),
    ar: z.string().min(2, t('validation_min_chars', { count: 2 })),
  }),
  email: z.string().email(t('invalid_email')),
  phone: z.string().min(8, t('validation_min_chars', { count: 8 })),
  type: z.nativeEnum(VendorType),
  status: z.nativeEnum(VendorStatus),
  is_active: z.boolean(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  formatted_address: z.string().min(2, t('validation_required')),
  image: z.any().optional(),
  working_hours: z.array(z.object({
    day_of_week: z.number().min(0).max(6),
    open_time: z.string().min(5),
    close_time: z.string().min(5),
  })).optional(),
  delivery_zones: z.array(z.object({
    delivery_zone_id: z.number().min(1),
    min_order_amount: z.coerce.number().min(0),
    estimated_delivery_time: z.coerce.number().min(1),
  })).optional(),
});

export const vendorFormDefaults: Partial<VendorForm> = {
  type: VendorType.RESTAURANT,
  status: VendorStatus.OFFLINE,
  is_active: true,
  latitude: 0,
  longitude: 0,
  working_hours: [],
  delivery_zones: [],
};

export const toVendorFormValues = (vendor: Vendor): VendorForm => ({
  owner_id: vendor.owner_id,
  name: {
    en: vendor.name?.en || '',
    ar: vendor.name?.ar || '',
  },
  email: vendor.email,
  phone: vendor.phone,
  type: vendor.type,
  status: vendor.status,
  is_active: vendor.is_active,
  latitude: Number(vendor.latitude),
  longitude: Number(vendor.longitude),
  formatted_address: vendor.formatted_address,
  working_hours: vendor.working_hours?.map((workingHour) => ({
    day_of_week: workingHour.day_of_week,
    open_time: workingHour.open_time.substring(0, 5),
    close_time: workingHour.close_time.substring(0, 5),
  })) || [],
  delivery_zones: vendor.delivery_zones?.map((deliveryZone) => ({
    delivery_zone_id: deliveryZone.delivery_zone_id,
    min_order_amount: Number(deliveryZone.min_order_amount),
    estimated_delivery_time: deliveryZone.estimated_delivery_time,
  })) || [],
});
