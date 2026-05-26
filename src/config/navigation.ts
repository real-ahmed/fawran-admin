import {
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  Shield,
  Store,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { PERMISSIONS } from '@/config/permissions';
import type { PermissionRequirement } from '@/utils/access';

export interface NavigationItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  permission?: PermissionRequirement;
  children?: NavigationItem[];
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { to: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  {
    to: '/admins-group',
    labelKey: 'admins',
    icon: Users,
    permission: [
      PERMISSIONS.VIEW_ADMINS,
      PERMISSIONS.VIEW_ROLES,
    ],
    children: [
      {
        to: '/admins',
        labelKey: 'admins',
        icon: Users,
        permission: PERMISSIONS.VIEW_ADMINS,
      },
      {
        to: '/roles',
        labelKey: 'roles',
        icon: Shield,
        permission: PERMISSIONS.VIEW_ROLES,
      },
    ],
  },
  { to: '/vendors', labelKey: 'vendors', icon: Store, permission: PERMISSIONS.VIEW_VENDORS },
  { to: '/couriers', labelKey: 'couriers', icon: Truck, permission: PERMISSIONS.VIEW_COURIERS },
  {
    to: '/catalog',
    labelKey: 'catalog',
    icon: Package,
    permission: [
      PERMISSIONS.VIEW_CATEGORIES,
      PERMISSIONS.VIEW_BRANDS,
      PERMISSIONS.VIEW_MASTER_PRODUCTS,
    ],
    children: [
      {
        to: '/catalog/categories',
        labelKey: 'categories',
        icon: Package,
        permission: PERMISSIONS.VIEW_CATEGORIES,
      },
      {
        to: '/catalog/brands',
        labelKey: 'brands',
        icon: Store,
        permission: PERMISSIONS.VIEW_BRANDS,
      },
      {
        to: '/catalog/products',
        labelKey: 'master_products',
        icon: Package,
        permission: PERMISSIONS.VIEW_MASTER_PRODUCTS,
      },
    ],
  },
  { to: '/finances', labelKey: 'finances', icon: CreditCard, permission: PERMISSIONS.VIEW_FINANCES },
  {
    to: '/settings',
    labelKey: 'settings',
    icon: Settings,
    permission: PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
  },
];

const flattenNavigationItems = (items: NavigationItem[]): NavigationItem[] =>
  items.flatMap((item) => [item, ...(item.children ? flattenNavigationItems(item.children) : [])]);

export const getCurrentNavigationItem = (pathname: string) =>
  flattenNavigationItems(NAVIGATION_ITEMS)
    .filter((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0];
