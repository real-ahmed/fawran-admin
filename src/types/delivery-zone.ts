export interface Coordinate {
  lat: number;
  lng: number;
}

export interface VehicleFee {
  vehicle_type: 'car' | 'motorcycle' | 'bicycle';
  base_delivery_fee: number;
  fee_per_km: number;
  max_delivery_fee?: number;
}

export interface DeliveryZone {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  is_active: boolean;
  coordinates?: Coordinate[];
  geometry?: {
    type: string;
    coordinates: number[][][];
  };
  vehicle_fees?: VehicleFee[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateDeliveryZonePayload {
  name: {
    en: string;
    ar: string;
  };
  is_active: boolean;
  coordinates: Coordinate[];
  vehicle_fees?: VehicleFee[];
}

export interface UpdateDeliveryZonePayload extends CreateDeliveryZonePayload {}
