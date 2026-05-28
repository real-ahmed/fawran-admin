// Base types
export type { BrandSubmittedEvent } from './BrandSubmittedEvent';
export type { CategorySubmittedEvent } from './CategorySubmittedEvent';
export type { MasterProductSubmittedEvent } from './MasterProductSubmittedEvent';

// Shared primitives
export type LocalizedValue = {
  en?: string;
  ar?: string;
};

export type CatalogApprovalStatus = 'pending' | 'approved' | 'rejected';
export type CatalogStatusFilter = 'all' | CatalogApprovalStatus;
export type ActiveFilter = 'all' | 'active' | 'inactive';
export type CatalogResourceKey = 'brands' | 'categories' | 'master-products';

export type ProductUnitType = 'piece' | 'kg' | 'gram' | 'portion';

// Query params
export interface CatalogQuery {
  page?: number;
  per_page?: number;
  search?: string;
  approval_status?: CatalogApprovalStatus;
  is_active?: boolean | 0 | 1;
  category_id?: number;
  brand_id?: number;
  unit_type?: ProductUnitType;
}

// Models
export interface Brand {
  id: number;
  name: LocalizedValue;
  is_active: boolean;
  image?: string | null;
}

export interface Category {
  id: number;
  name: LocalizedValue;
  is_active: boolean;
  parent_category_id?: number | null;
  icon_class?: string | null;
  image?: string | null;
}

export interface MasterProduct {
  id: number;
  name: LocalizedValue;
  category?: {
    id: number;
    name: LocalizedValue;
  };
  unit_type?: ProductUnitType;
  is_active: boolean;
  description?: LocalizedValue | string | null;
  retail_detail?: {
    brand_id?: number | null;
    sku_barcode?: string | null;
  } | null;
  image?: string | null;
  images?: string[] | null;
  created_at?: string | null;
}

// Form payloads
export interface BrandPayload {
  name: Required<Pick<LocalizedValue, 'en' | 'ar'>>;
  is_active: boolean;
  image?: FileList | null;
}

export interface CategoryPayload extends BrandPayload {
  parent_category_id?: number | null;
  icon_class?: string | null;
}

export interface MasterProductPayload {
  name: Required<Pick<LocalizedValue, 'en' | 'ar'>>;
  description: Required<Pick<LocalizedValue, 'en' | 'ar'>>;
  category_id: number;
  brand_id?: number | null;
  unit_type: ProductUnitType;
  sku_barcode?: string | null;
  is_active: boolean;
  image?: FileList | null;
  images?: FileList | null;
  retained_images?: string[];
}
