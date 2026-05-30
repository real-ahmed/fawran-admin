import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '@/services/subscriptionService';
import { AssignSubscriptionData, SubscriptionPlan } from '@/types/subscription';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export const useSubscriptionPlans = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: subscriptionService.getPlans,
  });

  const createPlan = useMutation({
    mutationFn: (data: Partial<SubscriptionPlan>) => subscriptionService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      toast.success(t('messages.created_successfully', 'Created successfully'));
    },
    onError: () => {
      toast.error(t('messages.error_occurred', 'An error occurred'));
    }
  });

  const updatePlan = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SubscriptionPlan> }) => 
      subscriptionService.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      toast.success(t('messages.updated_successfully', 'Updated successfully'));
    },
    onError: () => {
      toast.error(t('messages.error_occurred', 'An error occurred'));
    }
  });

  const deletePlan = useMutation({
    mutationFn: (id: number) => subscriptionService.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      toast.success(t('messages.deleted_successfully', 'Deleted successfully'));
    },
    onError: () => {
      toast.error(t('messages.error_occurred', 'An error occurred'));
    }
  });

  return { plans, isLoading, createPlan, updatePlan, deletePlan };
};

export const useVendorSubscriptions = (vendorId: number) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['vendorSubscriptions', vendorId],
    queryFn: () => subscriptionService.getVendorSubscriptions(vendorId),
    enabled: !!vendorId,
  });

  const assignSubscription = useMutation({
    mutationFn: (data: AssignSubscriptionData) => subscriptionService.assignSubscription(vendorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorSubscriptions', vendorId] });
      // Invalidate the vendor details query as well to refresh custom commission vs subscription logic if it's there
      queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
      toast.success(t('messages.assigned_successfully', 'Assigned successfully'));
    },
    onError: () => {
      toast.error(t('messages.error_occurred', 'An error occurred'));
    }
  });

  return { subscriptions, isLoading, assignSubscription };
};

export const useExpiringSubscriptions = () => {
  return useQuery({
    queryKey: ['expiringSubscriptions'],
    queryFn: () => subscriptionService.getExpiringSubscriptions(1),
  });
};
