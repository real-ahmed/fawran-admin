import { useAuthStore } from '@/store/authStore';
import { hasPermission, type PermissionRequirement } from '@/utils/access';

export const useHasPermission = (permission: PermissionRequirement) => {
  const permissions = useAuthStore((state) => state.permissions) || [];

  return hasPermission(permissions, permission);
};
