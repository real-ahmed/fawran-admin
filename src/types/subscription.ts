export interface SubscriptionPlan {
  id: number;
  name: {
    en: string;
    ar: string;
  };
  monthly_price: number;
  commission_percentage: number;
  features: {
    visibility_boost: boolean;
    advanced_analytics: boolean;
    marketing_tools: boolean;
    priority_support: boolean;
    [key: string]: boolean;
  } | null;
  is_active: boolean;
  created_at: string;
}

export interface VendorSubscription {
  id: number;
  vendor_id: number;
  vendor_name?: string;
  owner_name?: string;
  owner_phone?: string;
  plan_id: number;
  plan?: SubscriptionPlan;
  status: 'active' | 'expired' | 'cancelled';
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface AssignSubscriptionData {
  plan_id: number;
  duration_months?: number;
  starts_at?: string;
  expires_at?: string;
}
