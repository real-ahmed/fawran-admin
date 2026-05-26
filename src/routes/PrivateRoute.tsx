import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { hasPermission, type PermissionRequirement } from '@/utils/access';

interface PrivateRouteProps {
  requiredPermission?: PermissionRequirement;
}

export const PrivateRoute = ({ requiredPermission }: PrivateRouteProps) => {
  const token = useAuthStore((state) => state.token);
  const permissions = useAuthStore((state) => state.permissions) || [];

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(permissions, requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
