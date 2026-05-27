export enum CourierVehicleType {
  MOTORCYCLE = 'motorcycle',
  BICYCLE = 'bicycle',
  CAR = 'car',
}

export interface CourierUser {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface CourierDocument {
  criminal_record_file?: string;
  contract_number?: string;
}

export interface CourierLocation {
  latitude?: number;
  longitude?: number;
  located_at?: string;
}

export interface Courier {
  id: number;
  user: CourierUser;
  national_id?: string;
  vehicle_type: CourierVehicleType;
  plate_number: string;
  is_online: boolean;
  document?: CourierDocument;
  is_approved: boolean;
  approved_at?: string;
  location?: CourierLocation;
  created_at: string;
}

export interface CouriersQuery {
  page?: number;
  per_page?: number;
  search?: string;
  is_online?: boolean | number;
  vehicle_type?: string;
  approval_status?: 'pending' | 'approved';
}
