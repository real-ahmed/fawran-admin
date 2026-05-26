export type PermissionRequirement = string | string[] | undefined;

export const hasPermission = (
  permissions: string[] = [],
  requiredPermission?: PermissionRequirement
) => {
  if (!requiredPermission) return true;
  if (permissions.includes('*')) return true;

  return Array.isArray(requiredPermission)
    ? requiredPermission.some((permission) => permissions.includes(permission))
    : permissions.includes(requiredPermission);
};
