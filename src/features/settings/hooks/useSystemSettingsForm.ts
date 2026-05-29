import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  fetchSystemSettings,
  updateSystemSettings,
} from '@/services/settingsService';
import {
  settingsSchema,
  type SettingsForm,
  toSettingsFormValues,
  toSystemSettingsPayload,
} from '../settingsForm';

export const useSystemSettingsForm = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
  });

  const settingsQuery = useQuery({
    queryKey: ['system-settings'],
    queryFn: fetchSystemSettings,
    retry: false,
  });

  useEffect(() => {
    if (settingsQuery.data) {
      form.reset(toSettingsFormValues(settingsQuery.data));
    }
  }, [form, settingsQuery.data]);

  const mutation = useMutation({
    mutationFn: (data: SettingsForm) => updateSystemSettings(toSystemSettingsPayload(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      queryClient.invalidateQueries({ queryKey: ['appConfig'] });
      toast.success(t('saved'));
    },
    onError: () => {
      toast.error(t('save_failed'));
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    isSaving: mutation.isPending,
    form,
    submitSettings: form.handleSubmit((data) => mutation.mutate(data)),
  };
};
