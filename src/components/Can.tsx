import { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';

interface CanProps {
  permission: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const Can = ({ permission, children, fallback = null }: CanProps) => {
  const permissions = useAuthStore((state) => state.permissions) || [];

  const hasPermission = Array.isArray(permission)
    ? permission.some((p) => permissions.includes(p))
    : permissions.includes(permission);

  // If user is Super Admin (assuming ID 1 or a wildcard permission like '*'), we might want to bypass.
  // For now, strict check based on the array.
  // If your backend returns '*' for super admin, uncomment below:
  const isSuperAdmin = permissions.includes('*');

  if (hasPermission || isSuperAdmin) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
