import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
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
const AdminFormPage = lazy(() =>
  import('../features/admins/AdminFormPage').then((module) => ({ default: module.AdminFormPage }))
);
const VendorList = lazy(() =>
  import('../features/vendors/VendorList').then((module) => ({ default: module.VendorList }))
);
const VendorFormPage = lazy(() =>
  import('../features/vendors/VendorFormPage').then((module) => ({ default: module.VendorFormPage }))
);
const ExpiringSubscriptionsPage = lazy(() =>
  import('../features/vendors/ExpiringSubscriptionsPage').then((module) => ({ default: module.ExpiringSubscriptionsPage }))
);
const RolesList = lazy(() =>
  import('../features/roles/RolesList').then((module) => ({ default: module.RolesList }))
);
const RoleFormPage = lazy(() =>
  import('../features/roles/RoleFormPage').then((module) => ({ default: module.RoleFormPage }))
);
const SystemSettings = lazy(() =>
  import('../features/settings/SystemSettings').then((module) => ({ default: module.SystemSettings }))
);
const DeliveryZonesList = lazy(() =>
  import('../features/delivery-zones/DeliveryZonesList').then((module) => ({ default: module.DeliveryZonesList }))
);
const DeliveryZoneFormPage = lazy(() =>
  import('../features/delivery-zones/DeliveryZoneFormPage').then((module) => ({ default: module.DeliveryZoneFormPage }))
);
const CouriersPage = lazy(() =>
  import('../features/couriers/CouriersPage').then((module) => ({ default: module.CouriersPage }))
);
const CategoriesPage = lazy(() =>
  import('../features/catalog/CategoriesPage').then((module) => ({ default: module.CategoriesPage }))
);
const BrandsPage = lazy(() =>
  import('../features/catalog/BrandsPage').then((module) => ({ default: module.BrandsPage }))
);
const MasterProductsPage = lazy(() =>
  import('../features/catalog/MasterProductsPage').then((module) => ({ default: module.MasterProductsPage }))
);
const MasterProductFormPage = lazy(() =>
  import('../features/catalog/MasterProductFormPage').then((module) => ({ default: module.MasterProductFormPage }))
);
const OrdersPage = lazy(() =>
  import('../features/orders/OrdersPage').then((module) => ({ default: module.OrdersPage }))
);
const OrderDetailPage = lazy(() =>
  import('../features/orders/OrderDetailPage').then((module) => ({ default: module.OrderDetailPage }))
);
const FinancesOverview = lazy(() =>
  import('../features/finances/FinancesOverview').then((module) => ({ default: module.FinancesOverview }))
);
const SettlementsPage = lazy(() =>
  import('../features/finances/SettlementsPage').then((module) => ({ default: module.SettlementsPage }))
);
const PayoutRequestsPage = lazy(() =>
  import('../features/finances/PayoutRequestsPage').then((module) => ({ default: module.PayoutRequestsPage }))
);
const SubscriptionPlansPage = lazy(() =>
  import('../features/finance/SubscriptionPlansPage').then((module) => ({ default: module.SubscriptionPlansPage }))
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
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>
        </Route>

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route element={<PrivateRoute requiredPermission={PERMISSIONS.VIEW_ADMINS} />}>
              <Route path="/admins" element={<AdminsList />} />
              <Route path="/admins/create" element={<AdminFormPage />} />
              <Route path="/admins/:id/edit" element={<AdminFormPage />} />
            </Route>
            <Route element={<PrivateRoute requiredPermission={PERMISSIONS.VIEW_ROLES} />}>
              <Route path="/roles" element={<RolesList />} />
              <Route path="/roles/create" element={<RoleFormPage />} />
              <Route path="/roles/:id/edit" element={<RoleFormPage />} />
            </Route>
            <Route element={<PrivateRoute requiredPermission={PERMISSIONS.VIEW_VENDORS} />}>
              <Route path="/vendors" element={<VendorList />} />
              <Route path="/vendors/create" element={<VendorFormPage />} />
              <Route path="/vendors/expiring-subscriptions" element={<ExpiringSubscriptionsPage />} />
              <Route path="/vendors/:id/edit" element={<VendorFormPage />} />
            </Route>
            <Route element={<PrivateRoute requiredPermission={PERMISSIONS.VIEW_ORDERS} />}>
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
            </Route>
            <Route element={<PrivateRoute requiredPermission={PERMISSIONS.VIEW_FINANCES} />}>
              <Route path="/finances/overview" element={<FinancesOverview />} />
              <Route path="/finances/subscription-plans" element={<SubscriptionPlansPage />} />
            </Route>
            <Route element={<PrivateRoute requiredPermission={PERMISSIONS.MANAGE_SETTLEMENTS} />}>
              <Route path="/finances/settlements" element={<SettlementsPage />} />
            </Route>
            <Route element={<PrivateRoute requiredPermission={PERMISSIONS.MANAGE_PAYOUTS} />}>
              <Route path="/finances/payouts" element={<PayoutRequestsPage />} />
            </Route>
            <Route path="/finances" element={<Navigate to="/finances/overview" replace />} />
            <Route element={<PrivateRoute requiredPermission={PERMISSIONS.VIEW_COURIERS} />}>
              <Route path="/couriers" element={<CouriersPage />} />
            </Route>
            <Route element={<PrivateRoute requiredPermission={PERMISSIONS.VIEW_DELIVERY_ZONES} />}>
              <Route path="/delivery-zones" element={<DeliveryZonesList />} />
              <Route path="/delivery-zones/create" element={<DeliveryZoneFormPage />} />
              <Route path="/delivery-zones/:id/edit" element={<DeliveryZoneFormPage />} />
            </Route>
            <Route
              element={(
                <PrivateRoute
                  requiredPermission={[
                    PERMISSIONS.VIEW_CATEGORIES,
                    PERMISSIONS.VIEW_BRANDS,
                    PERMISSIONS.VIEW_MASTER_PRODUCTS,
                  ]}
                />
              )}
            >
              <Route path="/catalog" element={<Navigate to="/catalog/categories" replace />} />
            </Route>
            <Route element={<PrivateRoute requiredPermission={PERMISSIONS.VIEW_CATEGORIES} />}>
              <Route path="/catalog/categories" element={<CategoriesPage />} />
            </Route>
            <Route element={<PrivateRoute requiredPermission={PERMISSIONS.VIEW_BRANDS} />}>
              <Route path="/catalog/brands" element={<BrandsPage />} />
            </Route>
            <Route element={<PrivateRoute requiredPermission={PERMISSIONS.VIEW_MASTER_PRODUCTS} />}>
              <Route path="/catalog/products" element={<MasterProductsPage />} />
              <Route path="/catalog/products/create" element={<MasterProductFormPage />} />
              <Route path="/catalog/products/:id/edit" element={<MasterProductFormPage />} />
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
