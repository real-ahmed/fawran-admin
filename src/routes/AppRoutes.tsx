import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { PrivateRoute } from './PrivateRoute';
import { PERMISSIONS } from '@/config/permissions';

const Login = lazy(() =>
  import('../features/auth/Login').then((module) => ({ default: module.Login }))
);
const Dashboard = lazy(() =>
  import('../features/dashboard/Dashboard').then((module) => ({ default: module.Dashboard }))
);
const AdminsList = lazy(() =>
  import('../features/admins/AdminsList').then((module) => ({ default: module.AdminsList }))
);
const VendorsList = lazy(() =>
  import('../features/vendors/VendorsList').then((module) => ({ default: module.VendorsList }))
);
const SystemSettings = lazy(() =>
  import('../features/settings/SystemSettings').then((module) => ({ default: module.SystemSettings }))
);

const RouteFallback = () => (
  <div className="flex min-h-48 items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route element={<PrivateRoute requiredPermission={PERMISSIONS.VIEW_ADMINS} />}>
              <Route path="/admins" element={<AdminsList />} />
            </Route>
            <Route element={<PrivateRoute requiredPermission={PERMISSIONS.VIEW_VENDORS} />}>
              <Route path="/vendors" element={<VendorsList />} />
            </Route>
            <Route element={<PrivateRoute requiredPermission={PERMISSIONS.MANAGE_SYSTEM_SETTINGS} />}>
              <Route path="/settings" element={<SystemSettings />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};
