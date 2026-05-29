import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';
import { createVendor, updateVendor, getVendor } from '@/services/vendorService';
import { createVendorOwner } from '@/services/vendorOwnerService';
import { VendorType, VendorStatus } from '@/types/vendor';
import { applyApiValidationErrors, parseApiError } from '@/utils/api';
import { FormFieldError } from '@/components/FormFieldError';
import { LocationPickerMap } from '@/components/LocationPickerMap';
import { FormPageSkeleton } from '@/components/FormPageSkeleton';
import { ImageUploader } from '@/components/ImageUploader';
import { resolveStorageAssetUrl } from '@/utils/assets';
import { useVendorOwnerSearch } from './hooks/useVendorOwnerSearch';
import { DeliveryZoneSearchSelect } from './components/DeliveryZoneSearchSelect';
import { SearchableSelect } from '@/components/SearchableSelect';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  createVendorFormSchema,
  toVendorFormValues,
  vendorFormDefaults,
  type VendorForm,
} from './vendorForm';

export const VendorFormPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(isEditing);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [selectedOwnerName, setSelectedOwnerName] = useState('');
  
  const {
    owners,
    searchTerm,
    setSearchTerm,
    isLoading: isLoadingOwners,
    isFetchingNextPage: ownersFetchingNextPage,
    hasNextPage: ownersHasNextPage,
    loadMoreRef: ownersLoadMoreRef,
  } = useVendorOwnerSearch();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VendorForm>({
    resolver: zodResolver(createVendorFormSchema(t)),
    defaultValues: vendorFormDefaults,
  });

  const { fields: workingHoursFields, append: appendWorkingHour, remove: removeWorkingHour } = useFieldArray({
    control,
    name: 'working_hours',
  });

  const { fields: deliveryZonesFields, append: appendDeliveryZone, remove: removeDeliveryZone } = useFieldArray({
    control,
    name: 'delivery_zones',
  });

  const currentLat = watch('latitude');
  const currentLng = watch('longitude');
  const selectedOwnerId = watch('owner_id');
  const ownerOptions = owners.map((owner) => ({
    value: String(owner.id),
    label: owner.name,
    description: owner.email,
  }));

  if (
    selectedOwnerId &&
    selectedOwnerName &&
    !ownerOptions.some((option) => option.value === String(selectedOwnerId))
  ) {
    ownerOptions.unshift({
      value: String(selectedOwnerId),
      label: selectedOwnerName,
      description: '',
    });
  }

  const vendorTypeOptions = Object.values(VendorType).map((type) => ({
    value: type,
    label: t(`vendor_type_${type}`),
  }));
  const vendorStatusOptions = Object.values(VendorStatus).map((status) => ({
    value: status,
    label: t(`vendor_status_${status}`),
  }));
  const weekDayOptions = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ].map((day, index) => ({
    value: String(index),
    label: t(day),
  }));

  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      getVendor(Number(id))
        .then((vendor) => {
          reset(toVendorFormValues(vendor));
          if (vendor.owner_name) {
            setSelectedOwnerName(vendor.owner_name);
          }
          if (vendor.image) {
            setExistingImage(vendor.image);
          }
        })
        .catch((err) => {
          toast.error(parseApiError(err, t('error_loading_vendor')));
          navigate('/vendors');
        })
        .finally(() => setIsLoading(false));
    }
  }, [isEditing, id, reset, t, navigate]);

  const mutation = useMutation({
    mutationFn: (data: VendorForm) => {
      if (isEditing && id) {
        return updateVendor(Number(id), data);
      }
      return createVendor(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success(t('saved'));
      navigate('/vendors');
    },
    onError: (error) => {
      applyApiValidationErrors<VendorForm>(error, setError);
      toast.error(parseApiError(error, t('save_failed')));
    },
  });

  const onSubmit = (data: VendorForm) => {
    mutation.mutate(data);
  };

  // Create Owner logic
  const [createOwnerOpen, setCreateOwnerOpen] = useState(false);
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');

  const createOwnerMutation = useMutation({
    mutationFn: () => createVendorOwner({
      name: newOwnerName,
      email: newOwnerEmail,
      phone: newOwnerPhone,
      is_active: true
    }),
    onSuccess: (newOwner) => {
      queryClient.invalidateQueries({ queryKey: ['vendorOwners'] });
      setValue('owner_id', newOwner.id);
      setSelectedOwnerName(newOwner.name);
      setSearchTerm('');
      setCreateOwnerOpen(false);
      setNewOwnerName('');
      setNewOwnerEmail('');
      setNewOwnerPhone('');
      toast.success(t('owner_created_successfully'));
    },
    onError: (error) => {
      toast.error(parseApiError(error, t('owner_create_failed')));
    }
  });

  if (isLoading) {
    return <FormPageSkeleton sections={3} />;
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={isEditing ? t('edit_vendor') : t('create_vendor')}
        description={isEditing ? t('edit_vendor_desc') : t('create_vendor_desc')}
      >
        <Button variant="outline" onClick={() => navigate('/vendors')} className="gap-2">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('back')}
        </Button>
      </PageHeader>

      <div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="details" className="w-full" dir={i18n.dir()}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto gap-2 p-1 bg-muted/50 rounded-lg mb-6">
              <TabsTrigger value="details" className="py-2.5 rounded-md">{t('vendor_details')}</TabsTrigger>
              <TabsTrigger value="contact" className="py-2.5 rounded-md">{t('contact_info')}</TabsTrigger>
              <TabsTrigger value="location" className="py-2.5 rounded-md">{t('location')}</TabsTrigger>
              <TabsTrigger value="working_hours" className="py-2.5 rounded-md">{t('working_hours')}</TabsTrigger>
              <TabsTrigger value="delivery_zones" className="py-2.5 rounded-md">{t('delivery_zones')}</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-0 outline-none">
              <div className="grid gap-6 sm:grid-cols-2 bg-card border rounded-xl p-6">
              <div className="grid gap-2 sm:col-span-2">
                <Label className="text-sm font-medium">{t('vendor_image')}</Label>
                <ImageUploader 
                  id="image" 
                  previewUrl={resolveStorageAssetUrl(existingImage)} 
                  registration={register('image')} 
                  className="h-48 w-full max-w-sm"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name_en" className="text-sm font-medium">
                  {t('vendor_name_en')} <span className="text-destructive">*</span>
                </Label>
                <Input id="name_en" {...register('name.en')} className="w-full bg-muted/40" dir="ltr" />
                <FormFieldError message={errors.name?.en?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name_ar" className="text-sm font-medium">
                  {t('vendor_name_ar')} <span className="text-destructive">*</span>
                </Label>
                <Input id="name_ar" {...register('name.ar')} className="w-full bg-muted/40" dir="rtl" />
                <FormFieldError message={errors.name?.ar?.message} />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-sm font-medium">
                  {t('vendor_type')} <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      options={vendorTypeOptions}
                      onChange={(value) => field.onChange(value as VendorType)}
                      placeholder={t('vendor_type')}
                      triggerClassName="bg-muted/40"
                    />
                  )}
                />
                <FormFieldError message={errors.type?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  {t('vendor_status')} <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      options={vendorStatusOptions}
                      onChange={(value) => field.onChange(value as VendorStatus)}
                      placeholder={t('vendor_status')}
                      triggerClassName="bg-muted/40"
                    />
                  )}
                />
                <FormFieldError message={errors.status?.message} />
              </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="mt-0 outline-none">
              <div className="grid gap-6 sm:grid-cols-2 bg-card border rounded-xl p-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t('email')} <span className="text-destructive">*</span>
                </Label>
                <Input id="email" type="email" {...register('email')} className="w-full bg-muted/40" dir="ltr" />
                <FormFieldError message={errors.email?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  {t('phone')} <span className="text-destructive">*</span>
                </Label>
                <Input id="phone" type="tel" {...register('phone')} className="w-full bg-muted/40" dir="ltr" />
                <FormFieldError message={errors.phone?.message} />
              </div>

              {/* Owner Combobox Section */}
              <div className="grid gap-2 sm:col-span-2">
                <Label className="text-sm font-medium">
                  {t('vendor_owner')} <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <Controller
                      control={control}
                      name="owner_id"
                      render={({ field }) => (
                        <SearchableSelect
                          value={field.value ? String(field.value) : ''}
                          options={ownerOptions}
                          onChange={(value) => {
                            const owner = owners.find((item) => item.id === Number(value));
                            field.onChange(Number(value));
                            setSelectedOwnerName(owner?.name ?? '');
                            setSearchTerm('');
                          }}
                          placeholder={t('vendor_owner')}
                          searchPlaceholder={t('search_owner_placeholder')}
                          searchTerm={searchTerm}
                          onSearchChange={setSearchTerm}
                          isLoading={isLoadingOwners}
                          isFetchingNextPage={ownersFetchingNextPage}
                          hasNextPage={Boolean(ownersHasNextPage)}
                          loadMoreRef={ownersLoadMoreRef}
                          triggerClassName="bg-muted/40"
                        />
                      )}
                    />
                    <FormFieldError message={errors.owner_id?.message} />
                  </div>
                  
                  <Dialog open={createOwnerOpen} onOpenChange={setCreateOwnerOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" className="gap-2 shrink-0 h-10">
                        <Plus className="h-4 w-4" />
                        {t('add_new')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('create_new_vendor_owner')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>{t('name')} *</Label>
                          <Input value={newOwnerName} onChange={e => setNewOwnerName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('email')} *</Label>
                          <Input value={newOwnerEmail} onChange={e => setNewOwnerEmail(e.target.value)} dir="ltr" />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('phone')} *</Label>
                          <Input value={newOwnerPhone} onChange={e => setNewOwnerPhone(e.target.value)} dir="ltr" />
                        </div>
                        <Button 
                          type="button" 
                          onClick={() => createOwnerMutation.mutate()}
                          disabled={createOwnerMutation.isPending || !newOwnerName || !newOwnerEmail || !newOwnerPhone}
                          className="w-full"
                        >
                          {createOwnerMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                          {t('create_vendor_owner')}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              </div>
            </TabsContent>

            <TabsContent value="location" className="mt-0 outline-none">
              <div className="grid gap-6 bg-card border rounded-xl p-6">
              <div className="grid gap-2">
                <Label htmlFor="formatted_address" className="text-sm font-medium">
                  {t('formatted_address')} <span className="text-destructive">*</span>
                </Label>
                <Input id="formatted_address" {...register('formatted_address')} className="w-full bg-muted/40" />
                <FormFieldError message={errors.formatted_address?.message} />
              </div>
              
              <LocationPickerMap
                latitude={currentLat && currentLat !== 0 ? currentLat : undefined}
                longitude={currentLng && currentLng !== 0 ? currentLng : undefined}
                onLocationSelect={(lat, lng, address) => {
                  setValue('latitude', lat, { shouldValidate: true });
                  setValue('longitude', lng, { shouldValidate: true });
                  if (address) {
                    setValue('formatted_address', address, { shouldValidate: true });
                  }
                }}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-sm text-muted-foreground">{t('latitude')}</Label>
                  <Input type="number" step="any" {...register('latitude', { valueAsNumber: true })} className="bg-muted/40" readOnly />
                  <FormFieldError message={errors.latitude?.message} />
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm text-muted-foreground">{t('longitude')}</Label>
                  <Input type="number" step="any" {...register('longitude', { valueAsNumber: true })} className="bg-muted/40" readOnly />
                  <FormFieldError message={errors.longitude?.message} />
                </div>
              </div>
              </div>
            </TabsContent>

            {/* Working Hours */}
            <TabsContent value="working_hours" className="mt-0 outline-none">
              <div className="space-y-6 bg-card border rounded-xl p-6">
                <div className="flex items-center justify-between pb-2 border-b">
                  <h3 className="text-lg font-semibold">{t('working_hours')}</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => appendWorkingHour({ day_of_week: 0, open_time: '09:00', close_time: '22:00' })}>
                <Plus className="h-4 w-4" />
                {t('add_working_hour')}
              </Button>
            </div>
            
            <div className="grid gap-4">
              {workingHoursFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end bg-muted/20 p-4 rounded-xl border">
	                  <div className="grid gap-2">
	                    <Label className="text-xs">{t('day_of_week')}</Label>
	                    <Controller
	                      control={control}
	                      name={`working_hours.${index}.day_of_week`}
	                      render={({ field }) => (
	                        <SearchableSelect
	                          value={String(field.value)}
	                          options={weekDayOptions}
	                          onChange={(value) => field.onChange(Number(value))}
	                          placeholder={t('day_of_week')}
	                        />
	                      )}
	                    />
	                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">{t('open_time')}</Label>
                    <Input type="time" {...register(`working_hours.${index}.open_time`)} className="bg-background" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">{t('close_time')}</Label>
                    <Input type="time" {...register(`working_hours.${index}.close_time`)} className="bg-background" />
                  </div>
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeWorkingHour(index)}>
                    &times;
                  </Button>
                </div>
              ))}
              {workingHoursFields.length === 0 && (
                <div className="text-center p-4 border border-dashed rounded-xl text-muted-foreground text-sm">
                  {t('no_working_hours')}
                </div>
              )}
            </div>
              </div>
            </TabsContent>

            {/* Delivery Zones */}
            <TabsContent value="delivery_zones" className="mt-0 outline-none">
              <div className="space-y-6 bg-card border rounded-xl p-6">
                <div className="flex items-center justify-between pb-2 border-b">
                  <h3 className="text-lg font-semibold">{t('delivery_zones')}</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => appendDeliveryZone({ delivery_zone_id: 0, min_order_amount: 0, estimated_delivery_time: 30 })}>
                <Plus className="h-4 w-4" />
                {t('add_delivery_zone')}
              </Button>
            </div>
            
            <div className="grid gap-4">
              {deliveryZonesFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end bg-muted/20 p-4 rounded-xl border">
                  <div className="grid gap-2">
                    <Label className="text-xs">{t('delivery_zone')}</Label>
                    <Controller
                      control={control}
                      name={`delivery_zones.${index}.delivery_zone_id`}
                      render={({ field }) => (
                        <DeliveryZoneSearchSelect
                          value={field.value}
                          onChange={(id) => field.onChange(id)}
                          error={errors.delivery_zones?.[index]?.delivery_zone_id?.message}
                        />
                      )}
                    />
                    <FormFieldError message={errors.delivery_zones?.[index]?.delivery_zone_id?.message} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">{t('min_order_amount')}</Label>
                    <Input type="number" step="0.01" min="0" {...register(`delivery_zones.${index}.min_order_amount`, { valueAsNumber: true })} className="bg-background" />
                    <FormFieldError message={errors.delivery_zones?.[index]?.min_order_amount?.message} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">{t('estimated_delivery_time_mins')}</Label>
                    <Input type="number" min="1" {...register(`delivery_zones.${index}.estimated_delivery_time`, { valueAsNumber: true })} className="bg-background" />
                    <FormFieldError message={errors.delivery_zones?.[index]?.estimated_delivery_time?.message} />
                  </div>
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeDeliveryZone(index)}>
                    &times;
                  </Button>
                </div>
              ))}
              {deliveryZonesFields.length === 0 && (
                <div className="text-center p-4 border border-dashed rounded-xl text-muted-foreground text-sm">
                  {t('no_delivery_zones')}
                </div>
              )}
            </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between bg-card border rounded-xl p-6">
            <div className="flex items-center gap-2">
              <Controller
              control={control}
              name="is_active"
              render={({ field }) => (
                <Checkbox
                  id="is_active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
              <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                {t('active')}
              </Label>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate('/vendors')} type="button">
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t('save')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
