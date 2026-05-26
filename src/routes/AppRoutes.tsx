import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { PrivateRoute } from './PrivateRoute';
import { Login } from '../features/auth/Login';
import { useAppConfig } from '@/hooks/useAppConfig';

// Placeholder for Dashboard
const Dashboard = () => {
  const { t } = useTranslation();
  const { appName } = useAppConfig();
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
      <p>{t('welcome_desc', { appName })}</p>
    </div>
  );
};

export const AppRoutes = () => {
  return (
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
          {/* We will add more routes here (Admins, Vendors, etc.) */}
        </Route>
      </Route>
      
      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
