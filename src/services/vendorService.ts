import apiClient from '@/config/axios';
import type { PaginatedResponse } from '@/types/api';
import type { Vendor, CreateVendorPayload, UpdateVendorPayload } from '@/types/vendor';

export interface FetchVendorsParams {
  search?: string;
  type?: string;
  is_active?: boolean;
  status?: string;
  page?: number;
  per_page?: number;
}

export const fetchVendors = async (params?: FetchVendorsParams): Promise<PaginatedResponse<Vendor>> => {
  const cleanParams = Object.fromEntries(
    Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== '')
  );

  const res = await apiClient.get('/admin/vendors', { params: cleanParams });
  return res.data;
};

export const getVendor = async (id: number | string): Promise<Vendor> => {
  const res = await apiClient.get(`/admin/vendors/${id}`);
  return res.data.data;
};

const appendFormDataValue = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null) return;

  if (value instanceof FileList) {
    if (value.length > 0) {
      formData.append(key, value[0]);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      appendFormDataValue(formData, `${key}[${index}]`, item);
    });
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([childKey, childValue]) => {
      appendFormDataValue(formData, `${key}[${childKey}]`, childValue);
    });
    return;
  }

  if (typeof value === 'boolean') {
    formData.append(key, value ? '1' : '0');
    return;
  }

  formData.append(key, String(value));
};

const buildVendorFormData = (data: CreateVendorPayload | UpdateVendorPayload) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    appendFormDataValue(formData, key, value);
  });

  return formData;
};

export const createVendor = async (data: CreateVendorPayload): Promise<Vendor> => {
  const formData = buildVendorFormData(data);

  const res = await apiClient.post('/admin/vendors', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data.data;
};

export const updateVendor = async (id: number | string, data: UpdateVendorPayload): Promise<Vendor> => {
  const formData = buildVendorFormData(data);
  formData.append('_method', 'PUT');

  const res = await apiClient.post(`/admin/vendors/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data.data;
};

export const deleteVendor = async (id: number | string): Promise<void> => {
  await apiClient.delete(`/admin/vendors/${id}`);
};
