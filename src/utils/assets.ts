const getApiOrigin = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

  return baseUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
};

export const resolveStorageAssetUrl = (path?: string | null) => {
  if (!path) return undefined;

  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  const baseUrl = getApiOrigin() || 'http://localhost:8000';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const storagePrefix = normalizedPath.startsWith('/storage') ? '' : '/storage';

  return `${baseUrl}${storagePrefix}${normalizedPath}`;
};
