import { z } from 'zod';
import {
  type SystemSettingsResponse,
  type SystemSettingValue,
} from '@/services/settingsService';
import { parseLocalizedText } from '@/utils/localizedText';

export const settingsSchema = z.object({
  app_name_ar: z.string().optional(),
  app_name_en: z.string().optional(),
  app_logo_ar: z.any().optional(),
  app_logo_en: z.any().optional(),
  app_logo_white_ar: z.any().optional(),
  app_logo_white_en: z.any().optional(),
  app_icon_ar: z.any().optional(),
  app_icon_en: z.any().optional(),
  favicon_ar: z.any().optional(),
  favicon_en: z.any().optional(),
  currency: z.string().min(2).max(10).optional(),
  support_phone: z.string().optional(),
  timezone: z.string().optional(),
  default_store_commission: z.string().optional(),
  default_courier_commission: z.string().optional(),
  payout_minimum_threshold: z.string().optional(),
  p2p_platform_commission_percentage: z.string().optional(),
  tax_percentage: z.string().optional(),
  min_delivery_fee_floor: z.string().optional(),
  max_delivery_fee_ceiling: z.string().optional(),
  min_order_amount_floor: z.string().optional(),
  min_order_amount_ceiling: z.string().optional(),
  max_delivery_radius_km: z.string().optional(),
  settlement_cycle_days: z.string().optional(),
  courier_cod_wallet_deduction_enabled: z.string().optional(),
  courier_max_cash_hold_limit: z.string().optional(),
  hot_zone_order_threshold: z.string().optional(),
  hot_zone_radius_meters: z.string().optional(),
  hot_zone_expiry_minutes: z.string().optional(),
  hot_zone_check_interval: z.string().optional(),
  auto_cancel_unaccepted_minutes: z.string().optional(),
  courier_search_radius_km: z.string().optional(),
  courier_contract_template: z.string().optional(),
  courier_base_start: z.string().optional(),
  courier_per_km: z.string().optional(),
});

export type SettingsForm = z.infer<typeof settingsSchema>;

export const toSettingsFormValues = (settings: SystemSettingsResponse): SettingsForm => {
  const appName = parseLocalizedText(settings.app_name);

  return {
    app_name_ar: appName.ar || '',
    app_name_en: appName.en || '',
    currency: settings.currency ?? '',
    support_phone: settings.support_phone ?? '',
    timezone: settings.timezone ?? '',
    default_store_commission: settings.default_store_commission ?? '',
    default_courier_commission: settings.default_courier_commission ?? '',
    payout_minimum_threshold: settings.payout_minimum_threshold ?? '',
    p2p_platform_commission_percentage: settings.p2p_platform_commission_percentage ?? '',
    tax_percentage: settings.tax_percentage ?? '',
    min_delivery_fee_floor: settings.min_delivery_fee_floor ?? '',
    max_delivery_fee_ceiling: settings.max_delivery_fee_ceiling ?? '',
    min_order_amount_floor: settings.min_order_amount_floor ?? '',
    min_order_amount_ceiling: settings.min_order_amount_ceiling ?? '',
    max_delivery_radius_km: settings.max_delivery_radius_km ?? '',
    settlement_cycle_days: settings.settlement_cycle_days ?? '',
    courier_cod_wallet_deduction_enabled: settings.courier_cod_wallet_deduction_enabled ?? 'false',
    courier_max_cash_hold_limit: settings.courier_max_cash_hold_limit ?? '',
    hot_zone_order_threshold: settings.hot_zone_order_threshold ?? '',
    hot_zone_radius_meters: settings.hot_zone_radius_meters ?? '',
    hot_zone_expiry_minutes: settings.hot_zone_expiry_minutes ?? '',
    hot_zone_check_interval: settings.hot_zone_check_interval ?? '',
    auto_cancel_unaccepted_minutes: settings.auto_cancel_unaccepted_minutes ?? '',
    courier_search_radius_km: settings.courier_search_radius_km ?? '',
    courier_contract_template: settings.courier_contract_template ?? '',
    courier_base_start: settings.courier_base_start ?? '',
    courier_per_km: settings.courier_per_km ?? '',
  };
};

export const toSystemSettingsPayload = (data: SettingsForm): Record<string, SystemSettingValue> => {
  const { app_name_ar, app_name_en, ...rest } = data;
  const payload: Record<string, SystemSettingValue> = { ...rest };

  if (app_name_ar || app_name_en) {
    payload.app_name = JSON.stringify({
      ar: app_name_ar || '',
      en: app_name_en || '',
    });
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== '')
  ) as Record<string, SystemSettingValue>;
};
