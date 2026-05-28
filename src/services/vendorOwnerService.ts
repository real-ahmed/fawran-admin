import apiClient from '@/config/axios';
import type { PaginatedResponse } from '@/types/api';
import type { VendorOwner, CreateVendorOwnerPayload } from '@/types/vendorOwner';

export interface FetchVendorOwnersParams {
  search?: string;
  page?: number;
}

export const fetchVendorOwners = async (params?: FetchVendorOwnersParams): Promise<PaginatedResponse<VendorOwner>> => {
  const cleanParams = Object.fromEntries(
    Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== '')
  );

  const res = await apiClient.get('/admin/vendor-owners', { params: cleanParams });
  return res.data;
};

export const createVendorOwner = async (data: CreateVendorOwnerPayload): Promise<VendorOwner> => {
  const res = await apiClient.post('/admin/vendor-owners', data);
  return res.data.data;
};
