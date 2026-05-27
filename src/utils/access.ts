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

export const SUPER_ADMIN_ROLE = 'Super Admin';
export const FIRST_SUPER_ADMIN_ID = 1;

type RoleLike = {
  name?: string;
};

type AdminLike = {
  id?: number;
  roles?: RoleLike[];
};

export const isSuperAdminRole = (role?: RoleLike | null) =>
  role?.name === SUPER_ADMIN_ROLE;

export const hasSuperAdminRole = (roles: RoleLike[] = []) =>
  roles.some(isSuperAdminRole);

export const isProtectedAdminAccount = (admin?: AdminLike | null) =>
  admin?.id === FIRST_SUPER_ADMIN_ID;
