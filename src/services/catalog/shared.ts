import type { CatalogQuery } from '@/types/catalog';

export const cleanCatalogQuery = (params?: CatalogQuery) =>
  Object.fromEntries(
    Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== '' && value !== null)
  );

export const toCatalogFormData = (payload: object, isUpdate: boolean = false): FormData => {
  const formData = new FormData();

  if (isUpdate) {
    formData.append('_method', 'PUT');
  }

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (value instanceof FileList) {
      if (value.length > 0) {
        if (key === 'images') {
          for (let i = 0; i < value.length; i++) {
            formData.append(`${key}[${i}]`, value[i]);
          }
        } else {
          formData.append(key, value[0]);
        }
      }
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      Object.entries(value).forEach(([subKey, subValue]) => {
        if (subValue !== undefined && subValue !== null) {
          formData.append(`${key}[${subKey}]`, String(subValue));
        }
      });
    } else if (typeof value === 'boolean') {
      formData.append(key, value ? '1' : '0');
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
};
