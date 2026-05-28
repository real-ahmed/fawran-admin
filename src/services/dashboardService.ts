import apiClient from '@/config/axios';
import type { OrderStatus } from '@/types/enums';

type DashboardOrderStatus =
  | OrderStatus.Pending
  | OrderStatus.Processing
  | OrderStatus.Delivered
  | OrderStatus.Cancelled;

export interface DashboardMetrics {
  orders: Record<DashboardOrderStatus, number> & {
    total: number;
  };
  vendors: {
    total: number;
    active: number;
  };
  couriers: {
    total: number;
    online: number;
    pending_approval: number;
  };
  revenue: {
    total_revenue: string;
    current_balance: string;
  };
}

export interface PendingApprovals {
  brands: { id: number; name: string }[];
  categories: { id: number; name: string }[];
  couriers: { id: number; name: string }[];
}

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const res = await apiClient.get('/admin/dashboard/metrics');
  return res.data.data;
};

export const fetchPendingApprovals = async (): Promise<PendingApprovals> => {
  const res = await apiClient.get('/admin/dashboard/pending-approvals');
  return res.data.data;
};
