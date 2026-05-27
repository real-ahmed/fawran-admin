import { VendorType, VendorStatus } from './enums';

export { VendorType, VendorStatus };

export interface VendorWorkingHour {
  id?: number;
  day_of_week: number;
  open_time: string;
  close_time: string;
}

export interface VendorDeliveryZone {
  id?: number;
  delivery_zone_id: number;
  min_order_amount: string | number;
  estimated_delivery_time: number;
  delivery_zone?: any; // To hold the actual DeliveryZone object if needed
}

export interface Vendor {
  id: number;
  owner_id: number;
  owner_name?: string;
  name: {
    en: string;
    ar: string;
  };
  type: VendorType;
  email: string;
  phone: string;
  latitude: number;
  longitude: number;
  formatted_address: string;
  is_active: boolean;
  image?: string;
  status: VendorStatus;
  working_hours?: VendorWorkingHour[];
  delivery_zones?: VendorDeliveryZone[];
  created_at: string;
  updated_at: string;
}

export interface CreateVendorPayload {
  owner_id: number;
  name: {
    en: string;
    ar: string;
  };
  type: VendorType;
  email: string;
  phone: string;
  latitude: number;
  longitude: number;
  formatted_address: string;
  is_active?: boolean;
  status?: VendorStatus;
  image?: FileList | null;
  working_hours?: Omit<VendorWorkingHour, 'id'>[];
  delivery_zones?: Omit<VendorDeliveryZone, 'id' | 'delivery_zone'>[];
}

export interface UpdateVendorPayload extends Partial<CreateVendorPayload> {}
