export interface Coordinate {
  lat: number;
  lng: number;
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
}

export interface UpdateDeliveryZonePayload extends CreateDeliveryZonePayload {}
