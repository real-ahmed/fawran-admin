import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FormFieldError } from '@/components/FormFieldError';
import { PageHeader } from '@/components/PageHeader';
import { ImageUploader } from '@/components/ImageUploader';
import { MultiImageUploader } from '@/components/MultiImageUploader';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { resolveStorageAssetUrl } from '@/utils/assets';
import { applyApiValidationErrors, parseApiError } from '@/utils/api';
import {
  createMasterProduct,
  getMasterProduct,
  updateMasterProduct,
} from '@/services/catalog/masterProductService';
import { getBrands } from '@/services/catalog/brandService';
import { getCategories } from '@/services/catalog/categoryService';
import type { Brand, Category, MasterProduct, MasterProductPayload, ProductUnitType } from '@/types/catalog';
import { UnitType } from '@/types/enums';
import { localizedName, productDescription } from './utils';

interface MasterProductFormValues {
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  category_id: string;
  brand_id: string;
  unit_type: ProductUnitType;
  sku_barcode: string;
  is_active: boolean;
  image?: FileList | null;
  images?: FileList | null;
}

const unitTypes = Object.values(UnitType);

export const MasterProductFormPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const queryClient = useQueryClient();
  const [multiplePreviews, setMultiplePreviews] = useState<string[]>([]);
  const [retainedImages, setRetainedImages] = useState<string[]>([]);

  const schema = z.object({
    name_en: z.string().min(1, t('validation_required')),
    name_ar: z.string().min(1, t('validation_required')),
    description_en: z.string().min(1, t('validation_required')),
    description_ar: z.string().min(1, t('validation_required')),
    category_id: z.string().min(1, t('validation_required')),
    brand_id: z.string(),
    unit_type: z.nativeEnum(UnitType),
    sku_barcode: z.string().optional(),
    is_active: z.boolean(),
    image: z.any().optional(),
    images: z.any().optional(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MasterProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name_en: '',
      name_ar: '',
      description_en: '',
      description_ar: '',
      category_id: '',
      brand_id: 'none',
      unit_type: UnitType.Piece,
      sku_barcode: '',
      is_active: true,
      image: null,
      images: null,
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['catalog', 'categories', 'options'],
    queryFn: () => getCategories(),
  });
  
  const { data: brandsData } = useQuery({
    queryKey: ['catalog', 'brands', 'options'],
    queryFn: () => getBrands(),
  });

  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];

  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ['catalog', 'master-products', id],
    queryFn: () => getMasterProduct(Number(id)),
    enabled: isEditing,
  });

  useEffect(() => {
    if (product) {
      reset({
        name_en: product.name?.en || '',
        name_ar: product.name?.ar || '',
        description_en: productDescription(product, 'en'),
        description_ar: productDescription(product, 'ar'),
        category_id: product.category?.id ? String(product.category.id) : '',
        brand_id: product.retail_detail?.brand_id ? String(product.retail_detail.brand_id) : 'none',
        unit_type: product.unit_type || UnitType.Piece,
        sku_barcode: product.retail_detail?.sku_barcode || '',
        is_active: product.is_active ?? true,
        image: null,
        images: null,
      });
      if (product.images) {
        setMultiplePreviews(product.images);
        setRetainedImages(product.images);
      }
    }
  }, [product, reset]);

  const mutation = useMutation({
    mutationFn: (payload: MasterProductPayload) =>
      isEditing ? updateMasterProduct(Number(id), payload) : createMasterProduct(payload),
    onSuccess: () => {
      toast.success(t('saved'));
      queryClient.invalidateQueries({ queryKey: ['catalog', 'master-products'] });
      navigate('/catalog/products');
    },
    onError: (error) => {
      applyApiValidationErrors<MasterProductFormValues>(error, setError, {
        'name.en': 'name_en',
        'name.ar': 'name_ar',
        'description.en': 'description_en',
        'description.ar': 'description_ar',
        category_id: 'category_id',
        brand_id: 'brand_id',
        unit_type: 'unit_type',
        sku_barcode: 'sku_barcode',
      });
      toast.error(parseApiError(error, t('save_failed')));
    },
  });

  const onSubmit = (values: MasterProductFormValues) => {
    const brandId = values.brand_id === 'none' ? null : Number(values.brand_id);

    mutation.mutate({
      name: {
        en: values.name_en,
        ar: values.name_ar,
      },
      description: {
        en: values.description_en,
        ar: values.description_ar,
      },
      category_id: Number(values.category_id),
      brand_id: brandId,
      unit_type: values.unit_type,
      sku_barcode: values.sku_barcode || null,
      is_active: values.is_active,
      image: values.image?.length ? values.image : null,
      images: values.images?.length ? values.images : null,
      retained_images: retainedImages.length > 0 ? retainedImages : undefined,
    });
  };

  const handleMultipleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const urls = files.map((f) => URL.createObjectURL(f));
      setMultiplePreviews(urls);
      setRetainedImages([]); // User selected new images, overriding old ones
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentFiles = watch('images') as FileList | null;
    
    if (currentFiles && currentFiles.length > 0) {
      // Removing a newly selected file
      const dt = new DataTransfer();
      const filesArray = Array.from(currentFiles);
      filesArray.splice(index, 1);
      filesArray.forEach(f => dt.items.add(f));
      setValue('images', dt.files, { shouldValidate: true });
    } else {
      // Removing an existing image
      const newRetained = [...retainedImages];
      newRetained.splice(index, 1);
      setRetainedImages(newRetained);
    }

    const newPreviews = [...multiplePreviews];
    newPreviews.splice(index, 1);
    setMultiplePreviews(newPreviews);
  };

  if (isEditing && isProductLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title={isEditing ? t('edit_master_product') : t('create_master_product')} 
        description={t('master_product_form_desc')} 
      >
        <Button variant="outline" onClick={() => navigate('/catalog/products')} className="gap-2">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('back')}
        </Button>
      </PageHeader>

      <div>
        <form id="master-product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="details" className="w-full" dir={i18n.dir()}>
            <TabsList className="grid w-full grid-cols-3 gap-2 p-1 bg-muted/50 rounded-lg mb-6 h-auto">
              <TabsTrigger value="details" className="py-2.5 rounded-md">{t('details', 'Details')}</TabsTrigger>
              <TabsTrigger value="categorization" className="py-2.5 rounded-md">{t('categorization', 'Categorization')}</TabsTrigger>
              <TabsTrigger value="media" className="py-2.5 rounded-md">{t('media', 'Media')}</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-0 outline-none">
              <div className="grid gap-6 sm:grid-cols-2 bg-card border rounded-xl p-6">
                <div className="grid gap-2">
                  <Label htmlFor="product-name-en" className="text-sm font-medium">{t('name_en')} <span className="text-destructive">*</span></Label>
                  <Input id="product-name-en" {...register('name_en')} className="bg-muted/40" />
                  <FormFieldError message={errors.name_en?.message} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-name-ar" className="text-sm font-medium">{t('name_ar')} <span className="text-destructive">*</span></Label>
                  <Input id="product-name-ar" {...register('name_ar')} dir="rtl" className="bg-muted/40" />
                  <FormFieldError message={errors.name_ar?.message} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="product-description-en" className="text-sm font-medium">{t('description_en')} <span className="text-destructive">*</span></Label>
                  <Input id="product-description-en" {...register('description_en')} className="bg-muted/40" />
                  <FormFieldError message={errors.description_en?.message} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-description-ar" className="text-sm font-medium">{t('description_ar')} <span className="text-destructive">*</span></Label>
                  <Input id="product-description-ar" {...register('description_ar')} dir="rtl" className="bg-muted/40" />
                  <FormFieldError message={errors.description_ar?.message} />
                </div>

                <div className="grid gap-2">
                  <Label className="text-sm font-medium">{t('unit_type')} <span className="text-destructive">*</span></Label>
                  <select
                    {...register('unit_type')}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-muted/40 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {unitTypes.map((unitType) => (
                      <option key={unitType} value={unitType}>{t(`unit_${unitType}`)}</option>
                    ))}
                  </select>
                  <FormFieldError message={errors.unit_type?.message} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sku-barcode" className="text-sm font-medium">{t('sku_barcode')}</Label>
                  <Input id="sku-barcode" {...register('sku_barcode')} className="bg-muted/40" />
                  <FormFieldError message={errors.sku_barcode?.message} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="categorization" className="mt-0 outline-none">
              <div className="grid gap-6 sm:grid-cols-2 bg-card border rounded-xl p-6">
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">{t('category')} <span className="text-destructive">*</span></Label>
                  <select
                    {...register('category_id')}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-muted/40 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="" disabled>{t('select_category')}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{localizedName(category.name, i18n.language)}</option>
                    ))}
                  </select>
                  <FormFieldError message={errors.category_id?.message} />
                </div>

                <div className="grid gap-2">
                  <Label className="text-sm font-medium">{t('brand')}</Label>
                  <select
                    {...register('brand_id')}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-muted/40 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="none">{t('no_brand')}</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>{localizedName(brand.name, i18n.language)}</option>
                    ))}
                  </select>
                  <FormFieldError message={errors.brand_id?.message} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="mt-0 outline-none">
              <div className="grid gap-6 sm:grid-cols-2 bg-card border rounded-xl p-6">
                <div className="grid gap-2 sm:col-span-2">
                  <Label className="text-sm font-medium">{t('primary_image')}</Label>
                  <ImageUploader
                    id="product-image"
                    registration={register('image')}
                    previewUrl={resolveStorageAssetUrl(product?.image)}
                    className="w-48 h-48 max-w-sm"
                  />
                  <FormFieldError message={errors.image?.message as string} />
                </div>

                <div className="grid gap-2 sm:col-span-2 border-t pt-6 mt-2">
                  <Label className="text-sm font-medium">{t('additional_images')}</Label>
                  <MultiImageUploader
                    id="product-additional-images"
                    registration={register('images')}
                    onImagesChange={handleMultipleImagesChange}
                    onRemove={handleRemoveImage}
                    previewUrls={multiplePreviews.map(src => resolveStorageAssetUrl(src) as string)}
                  />
                  <FormFieldError message={errors.images?.message as string} />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between bg-card border rounded-xl p-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked as boolean)}
              />
              <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                {t('active')}
              </Label>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/catalog/products')}>
                {t('cancel')}
              </Button>
              <Button type="submit" form="master-product-form" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {t('save')}
              </Button>
            </div>
          </div>
        </form>
      </div>

    </div>
  );
};
