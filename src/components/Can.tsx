import { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { hasPermission, type PermissionRequirement } from '@/utils/access';

interface CanProps {
  permission: PermissionRequirement;
  children: ReactNode;
  fallback?: ReactNode;
}

export const Can = ({ permission, children, fallback = null }: CanProps) => {
  const permissions = useAuthStore((state) => state.permissions) || [];

  if (hasPermission(permissions, permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
