export interface VendorOwner {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
}

export interface CreateVendorOwnerPayload {
  name: string;
  email: string;
  phone: string;
  is_active?: boolean;
}
