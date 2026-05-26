import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface PrivateRouteProps {
  requiredPermission?: string | string[];
}

export const PrivateRoute = ({ requiredPermission }: PrivateRouteProps) => {
  const token = useAuthStore((state) => state.token);
  const permissions = useAuthStore((state) => state.permissions) || [];

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission) {
    const hasPermission = Array.isArray(requiredPermission)
      ? requiredPermission.some((p) => permissions.includes(p))
      : permissions.includes(requiredPermission);
      
    const isSuperAdmin = permissions.includes('*');

    if (!hasPermission && !isSuperAdmin) {
      return <Navigate to="/dashboard" replace />; // or to a 403 page
    }
  }

  return <Outlet />;
};
