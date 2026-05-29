import type { ApprovalStatus, VehicleType } from './enums';

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
  vehicle_type: VehicleType;
  plate_number: string;
  is_online: boolean;
  document?: CourierDocument;
  is_approved: boolean;
  approved_at?: string;
  rejected_at?: string | null;
  location?: CourierLocation;
  created_at: string;
}

export interface CouriersQuery {
  page?: number;
  cursor?: string;
  search?: string;
  is_online?: boolean | number;
  vehicle_type?: VehicleType;
  approval_status?: CourierApprovalStatus;
}

export type CourierApprovalStatus = ApprovalStatus;
