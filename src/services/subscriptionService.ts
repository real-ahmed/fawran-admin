import api from '@/config/axios';
import { SubscriptionPlan, VendorSubscription, AssignSubscriptionData } from '@/types/subscription';

export const subscriptionService = {
  // Subscription Plans (Admin)
  getPlans: async () => {
    const { data } = await api.get<{ data: SubscriptionPlan[] }>('/admin/subscription-plans');
    return data.data;
  },

  createPlan: async (planData: Partial<SubscriptionPlan>) => {
    const { data } = await api.post<{ data: SubscriptionPlan }>('/admin/subscription-plans', planData);
    return data.data;
  },

  updatePlan: async (id: number, planData: Partial<SubscriptionPlan>) => {
    const { data } = await api.put<{ data: SubscriptionPlan }>(`/admin/subscription-plans/${id}`, planData);
    return data.data;
  },

  deletePlan: async (id: number) => {
    await api.delete(`/admin/subscription-plans/${id}`);
  },

  // Vendor Subscriptions
  getVendorSubscriptions: async (vendorId: number) => {
    const { data } = await api.get<{ data: VendorSubscription[] }>(`/admin/vendors/${vendorId}/subscriptions`);
    return data.data;
  },

  assignSubscription: async (vendorId: number, assignData: AssignSubscriptionData) => {
    const { data } = await api.post<{ data: VendorSubscription }>(`/admin/vendors/${vendorId}/subscriptions`, assignData);
    return data.data;
  },

  getExpiringSubscriptions: async (page = 1) => {
    const { data } = await api.get<{ data: any, meta: any }>(`/admin/vendors/expiring-subscriptions`, { params: { page } });
    return { data: data.data, meta: data.meta };
  }
};
