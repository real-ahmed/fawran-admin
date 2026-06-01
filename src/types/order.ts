import { OrderStatus, OrderType, PaymentMethod, PaymentStatus, DeliveryStatus, VehicleType } from './enums';

export interface OrderCustomer {
  id: number;
  name: string;
  phone: string;
}

export interface OrderAddress {
  formatted_address: string;
  latitude: string;
  longitude: string;
  building_number: string;
  phone: string;
}

export interface OrderDeliveryInfo {
  total_delivery_fee: string;
  delivery_zone: string;
  address: OrderAddress | null;
}

export interface OrderItemOption {
  option: string;
  value: string;
  additional_price: string;
}

export interface OrderItem {
  id: number;
  name: string;
  quantity: string;
  unit_price: string;
  options_price: string;
  notes: string | null;
  options: OrderItemOption[];
}

export interface SubOrder {
  id: number;
  vendor_id: number;
  vendor_name: string;
  vendor_lat?: number;
  vendor_lng?: number;
  sub_total: string;
  status: string;
  items: OrderItem[];
}

export interface OrderCourier {
  id: number;
  name: string;
  phone: string;
  vehicle_type: VehicleType;
  status: DeliveryStatus;
  latitude?: string | number;
  longitude?: string | number;
}

export interface OrderPayment {
  id: number;
  amount: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
}

export interface OrderStatusLog {
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_by_name: string;
  created_at: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface OrderCommission {
  vendorcommission_percentage: string;
  vendorcommission_amount: string;
  app_delivery_share: string;
  net_platform_profit: string;
}

export interface Order {
  id: number;
  order_type: OrderType;
  total_products: string;
  status: OrderStatus;
  customer: OrderCustomer | null;
  delivery_info: OrderDeliveryInfo | null;
  sub_orders: SubOrder[];
  courier: OrderCourier | null;
  payments: OrderPayment[];
  commissions: OrderCommission[];
  status_logs: OrderStatusLog[];
  delivery_path: LatLng[];
  payments_count: number;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusCounts {
  all: number;
  pending: number;
  processing: number;
  out_for_delivery: number;
  delivered: number;
  cancelled: number;
}

export interface OrdersQuery {
  page?: number;
  cursor?: string;
  search?: string;
  status?: OrderStatus;
  order_type?: OrderType;
  date_from?: string;
  date_to?: string;
  customer_id?: number;
  vendor_id?: number;
  courier_id?: number;
}
