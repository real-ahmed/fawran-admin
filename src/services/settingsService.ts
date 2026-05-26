import apiClient from '@/config/axios';

export interface SystemSetting {
  key: string;
  value: string;
  label?: string;
}

export interface SystemSettingsResponse {
  [key: string]: string;
}

export type SystemSettingValue =
  | string
  | number
  | boolean
  | FileList
  | null
  | undefined;

export const fetchSystemSettings = async (): Promise<SystemSettingsResponse> => {
  const res = await apiClient.get('/admin/system-settings');
  const data = res.data.data;
  
  if (Array.isArray(data)) {
    return data.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as SystemSettingsResponse);
  }
  
  return data;
};

export const updateSystemSettings = async (
  settings: Record<string, SystemSettingValue>
): Promise<void> => {
  const formData = new FormData();
  
  // Laravel requires POST with _method=PUT for multipart/form-data
  formData.append('_method', 'PUT');

  let index = 0;
  Object.entries(settings).forEach(([key, value]) => {
    if (value instanceof FileList) {
      if (value.length > 0) {
        formData.append(`settings[${index}][key]`, key);
        formData.append(`settings[${index}][value]`, value[0]);
        index++;
      }
      // skip empty FileLists entirely
    } else if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      formData.append(`settings[${index}][key]`, key);
      formData.append(`settings[${index}][value]`, String(value));
      index++;
    }
  });

  await apiClient.post('/admin/system-settings', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
