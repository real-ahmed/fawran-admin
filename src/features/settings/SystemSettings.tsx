import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Can } from '@/components/Can';
import { PageHeader } from '@/components/PageHeader';
import { PERMISSIONS } from '@/config/permissions';
import { Loader2, Settings, Save, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { parseLocalizedText } from '@/utils/localizedText';
import { resolveStorageAssetUrl } from '@/utils/assets';
import { ImageUploader } from '@/components/ImageUploader';
import { SearchableSelect } from '@/components/SearchableSelect';
import { useSystemSettingsForm } from './hooks/useSystemSettingsForm';
import type { SettingsForm } from './settingsForm';

// ─── Settings Field Component ────────────────────────────────────────────────
interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  previewUrl?: string;
  registration: ReturnType<typeof useForm<SettingsForm>>['register'];
}

const SettingField = ({ id, label, hint, placeholder, type = 'text', disabled, previewUrl, registration }: FieldProps) => (
  <div className="grid gap-2 w-full">
    <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
    
    {type === 'file' ? (
      <ImageUploader 
        id={id} 
        previewUrl={previewUrl} 
        registration={registration(id as keyof SettingsForm)} 
        className="h-36 w-full"
      />
    ) : (
      <>
        {previewUrl && (
          <div className="mb-2">
            <img src={previewUrl} alt={label} className="h-16 w-auto rounded-lg border border-border bg-muted/30 object-contain p-1.5 shadow-sm" />
          </div>
        )}
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          dir="ltr"
          className="w-full h-11 bg-muted/40 focus:bg-background transition-colors rounded-xl border-border/60 hover:border-border"
          {...registration(id as keyof SettingsForm)}
        />
      </>
    )}
    {hint && <p className="text-xs font-medium text-muted-foreground">{hint}</p>}
  </div>
);

interface SelectProps {
  id: keyof SettingsForm;
  label: string;
  hint?: string;
  disabled?: boolean;
  options: { value: string; label: string }[];
  control: ReturnType<typeof useForm<SettingsForm>>['control'];
}

const SettingSelect = ({ id, label, hint, disabled, options, control }: SelectProps) => (
  <div className="grid gap-2 w-full">
    <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
    <Controller
      control={control}
      name={id}
      render={({ field }) => (
        <SearchableSelect
          value={String(field.value ?? '')}
          options={options}
          onChange={field.onChange}
          placeholder={label}
          disabled={disabled}
          triggerClassName="h-11 rounded-xl border-border/60 bg-muted/40 shadow-sm hover:border-border focus-visible:bg-background"
        />
      )}
    />
    {hint && <p className="text-xs font-medium text-muted-foreground">{hint}</p>}
  </div>
);

// ─── Settings Section ────────────────────────────────────────────────────────
interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const SettingsSection = ({ title, description, children }: SectionProps) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-8 border-b border-border/40 last:border-0 first:pt-0 last:pb-0">
    <div className="lg:col-span-4 space-y-1.5">
      <h2 className="text-base font-semibold text-foreground tracking-tight">{title}</h2>
      {description && <p className="text-sm text-muted-foreground leading-relaxed pe-4">{description}</p>}
    </div>
    <div className="lg:col-span-8">
      {children}
    </div>
  </div>
);

// ─── Unauthorized State ───────────────────────────────────────────────────────
const UnauthorizedSettings = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
      <div className="p-4 bg-muted rounded-full">
        <Lock className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{t('access_denied')}</h2>
      <p className="text-sm text-muted-foreground max-w-sm">{t('access_denied_desc')}</p>
    </div>
  );
};

const SettingsPageSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
    {Array.from({ length: 4 }).map((_, sectionIndex) => (
      <div
        key={sectionIndex}
        className="grid grid-cols-1 gap-6 border-b border-border/40 py-8 first:pt-0 last:border-0 last:pb-0 lg:grid-cols-12"
      >
        <div className="space-y-2 lg:col-span-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:col-span-8">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Main Settings Page ───────────────────────────────────────────────────────
export const SystemSettings = () => {
  const { t } = useTranslation();
  const {
    settings,
    isLoading,
    isError,
    isSaving,
    form: { register, control },
    submitSettings,
  } = useSystemSettingsForm();

  // Show unauthorized state if 403
  if (isError) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            {t('system_settings')}
          </h1>
        </div>
        <UnauthorizedSettings />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t('system_settings')}
        description={t('system_settings_desc')}
      />

      {isLoading ? (
        <SettingsPageSkeleton />
      ) : (
        <form onSubmit={submitSettings} className="space-y-8 pb-10">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-10 divide-y divide-border/40">
          {/* General Settings */}
          <SettingsSection
            title={t('settings_general')}
            description={t('settings_general_desc')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField
                id="app_name_ar"
                label={`${t('settings_app_name')} (${t('language_ar')})`}
                placeholder="فورا"
                registration={register}
              />
              <SettingField
                id="app_name_en"
                label={`${t('settings_app_name')} (${t('language_en')})`}
                placeholder="Fawran"
                registration={register}
              />
              <SettingField
                id="timezone"
                label={t('settings_timezone')}
                placeholder="Africa/Cairo"
                registration={register}
              />
              <SettingField
                id="support_phone"
                label={t('settings_support_phone')}
                placeholder="+201000000000"
                registration={register}
              />
              <SettingField
                id="app_logo_ar"
                label={`${t('settings_app_logo')} (${t('language_ar')})`}
                type="file"
                previewUrl={resolveStorageAssetUrl(parseLocalizedText(settings?.app_logo)?.ar)}
                registration={register}
              />
              <SettingField
                id="app_logo_en"
                label={`${t('settings_app_logo')} (${t('language_en')})`}
                type="file"
                previewUrl={resolveStorageAssetUrl(parseLocalizedText(settings?.app_logo)?.en)}
                registration={register}
              />
              <SettingField
                id="app_logo_white_ar"
                label={`${t('settings_app_logo_white')} (${t('language_ar')})`}
                type="file"
                previewUrl={resolveStorageAssetUrl(parseLocalizedText(settings?.app_logo_white)?.ar)}
                registration={register}
              />
              <SettingField
                id="app_logo_white_en"
                label={`${t('settings_app_logo_white')} (${t('language_en')})`}
                type="file"
                previewUrl={resolveStorageAssetUrl(parseLocalizedText(settings?.app_logo_white)?.en)}
                registration={register}
              />
              <SettingField
                id="app_icon_ar"
                label={`${t('settings_app_icon')} (${t('language_ar')})`}
                type="file"
                previewUrl={resolveStorageAssetUrl(parseLocalizedText(settings?.app_icon)?.ar)}
                registration={register}
              />
              <SettingField
                id="app_icon_en"
                label={`${t('settings_app_icon')} (${t('language_en')})`}
                type="file"
                previewUrl={resolveStorageAssetUrl(parseLocalizedText(settings?.app_icon)?.en)}
                registration={register}
              />
              <SettingField
                id="favicon_ar"
                label={`${t('settings_favicon')} (${t('language_ar')})`}
                type="file"
                previewUrl={resolveStorageAssetUrl(parseLocalizedText(settings?.favicon)?.ar)}
                registration={register}
              />
              <SettingField
                id="favicon_en"
                label={`${t('settings_favicon')} (${t('language_en')})`}
                type="file"
                previewUrl={resolveStorageAssetUrl(parseLocalizedText(settings?.favicon)?.en)}
                registration={register}
              />
            </div>
          </SettingsSection>

          {/* Financial */}
          <SettingsSection
            title={t('settings_financial')}
            description={t('settings_financial_desc')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField
                id="currency"
                label={t('settings_currency')}
                hint={t('settings_currency_hint')}
                placeholder="SAR"
                registration={register}
              />
              <SettingField
                id="default_store_commission"
                label={t('settings_default_store_commission')}
                type="number"
                placeholder="10.00"
                registration={register}
              />
              <SettingField
                id="default_courier_commission"
                label={t('settings_default_courier_commission')}
                type="number"
                placeholder="5.00"
                registration={register}
              />
              <SettingField
                id="payout_minimum_threshold"
                label={t('settings_payout_minimum')}
                type="number"
                placeholder="500.00"
                registration={register}
              />
              <SettingField
                id="p2p_platform_commission_percentage"
                label={t('settings_p2p_commission')}
                type="number"
                placeholder="15.00"
                registration={register}
              />
              <SettingField
                id="tax_percentage"
                label={t('settings_tax_percentage')}
                type="number"
                placeholder="14.00"
                registration={register}
              />
            </div>
          </SettingsSection>

          {/* Delivery Constraints */}
          <SettingsSection
            title={t('settings_delivery')}
            description={t('settings_delivery_desc')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField
                id="min_delivery_fee_floor"
                label={t('settings_min_delivery_fee_floor')}
                type="number"
                placeholder="10.00"
                registration={register}
              />
              <SettingField
                id="max_delivery_fee_ceiling"
                label={t('settings_max_delivery_fee_ceiling')}
                type="number"
                placeholder="150.00"
                registration={register}
              />
              <SettingField
                id="min_order_amount_floor"
                label={t('settings_min_order_floor')}
                type="number"
                placeholder="20.00"
                registration={register}
              />
              <SettingField
                id="min_order_amount_ceiling"
                label={t('settings_min_order_ceiling')}
                type="number"
                placeholder="500.00"
                registration={register}
              />
              <SettingField
                id="max_delivery_radius_km"
                label={t('settings_max_delivery_radius')}
                type="number"
                placeholder="25"
                registration={register}
              />
            </div>
          </SettingsSection>

          {/* Settlements & Cash Control */}
          <SettingsSection
            title={t('settings_settlements')}
            description={t('settings_settlements_desc')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField
                id="settlement_cycle_days"
                label={t('settings_settlement_cycle')}
                type="number"
                placeholder="7"
                registration={register}
              />
              <SettingField
                id="courier_max_cash_hold_limit"
                label={t('settings_courier_max_cash')}
                type="number"
                placeholder="2000.00"
                registration={register}
              />
              <SettingSelect
                id="courier_cod_wallet_deduction_enabled"
                label={t('settings_courier_cod_enabled')}
	                options={[
	                  { value: 'true', label: t('yes') },
	                  { value: 'false', label: t('no') },
	                ]}
	                control={control}
	              />
            </div>
          </SettingsSection>

          {/* Hot Zones */}
          <SettingsSection
            title={t('settings_hot_zones')}
            description={t('settings_hot_zones_desc')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField
                id="hot_zone_order_threshold"
                label={t('settings_hz_threshold')}
                type="number"
                placeholder="5"
                registration={register}
              />
              <SettingField
                id="hot_zone_radius_meters"
                label={t('settings_hz_radius')}
                type="number"
                placeholder="1000"
                registration={register}
              />
              <SettingField
                id="hot_zone_expiry_minutes"
                label={t('settings_hz_expiry')}
                type="number"
                placeholder="30"
                registration={register}
              />
              <SettingField
                id="hot_zone_check_interval"
                label={t('settings_hz_interval')}
                type="number"
                placeholder="15"
                registration={register}
              />
            </div>
          </SettingsSection>

          {/* Order Operations */}
          <SettingsSection
            title={t('settings_order_ops')}
            description={t('settings_order_ops_desc')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField
                id="auto_cancel_unaccepted_minutes"
                label={t('settings_auto_cancel_mins')}
                type="number"
                placeholder="15"
                registration={register}
              />
              <SettingField
                id="courier_search_radius_km"
                label={t('settings_courier_search_radius')}
                type="number"
                placeholder="5"
                registration={register}
              />
              </div>
            </SettingsSection>

          {/* Legal & Contracts */}
          <SettingsSection
            title={t('legal_settings')}
          >
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2 w-full">
                <Label htmlFor="courier_contract_template" className="text-sm font-medium">{t('courier_contract_template')}</Label>
                <Controller
                  name="courier_contract_template"
                  control={control}
                  render={({ field }) => (
                    <div className="bg-background rounded-xl overflow-hidden [&_.ql-toolbar]:bg-muted [&_.ql-container]:min-h-[400px] [&_.ql-editor]:min-h-[400px] [&_.ql-editor]:text-base" dir="rtl">
                      <ReactQuill 
                        theme="snow" 
                        value={field.value || ''} 
                        onChange={field.onChange}
                        modules={{
                          toolbar: [
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            [{ 'align': [] }],
                            ['link', 'clean'],
                            [{ 'direction': 'rtl' }]
                          ]
                        }}
                      />
                    </div>
                  )}
                />
                <p className="text-xs font-medium text-muted-foreground">{t('courier_contract_template_desc')}</p>
              </div>
            </div>
          </SettingsSection>
          </div>

          <div className="flex justify-end pt-4">
            <Can permission={PERMISSIONS.MANAGE_SYSTEM_SETTINGS}>
              <Button
                type="submit"
                disabled={isSaving || isLoading}
                className="gap-2 h-12 px-8 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0 text-base font-semibold w-full sm:w-auto"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {isSaving ? t('saving') : t('save_settings')}
              </Button>
            </Can>
          </div>
        </form>
      )}
    </div>
  );
};
