// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Run 'npm run sync:enums' to update.

export enum ApprovalStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export enum DeliveryStatus {
  HeadingToStores = 'heading_to_vendors',
  PickingUp = 'picking_up',
  HeadingToCustomer = 'heading_to_customer',
  Completed = 'completed',
}

export enum ExecutionMethod {
  Cash = 'cash',
  Wallet = 'wallet',
  Bank = 'bank',
}

export enum FileType {
  Image = 'image',
  Video = 'video',
  Document = 'document',
}

export enum HotZoneIntensity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export enum OrderStatus {
  Pending = 'pending',
  Processing = 'processing',
  OutForDelivery = 'out_for_delivery',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}

export enum OrderType {
  Delivery = 'delivery',
  Pickup = 'pickup',
  InStore = 'in_store',
}

export enum P2pDeliveryStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  PickedUp = 'picked_up',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}

export enum P2pPaymentMethod {
  CreditCard = 'credit_card',
  Wallet = 'wallet',
  Cod = 'cod',
}

export enum PaymentMethod {
  Cod = 'cod',
  CreditCard = 'credit_card',
  Wallet = 'wallet',
  PosCash = 'pos_cash',
  PosCard = 'pos_card',
}

export enum PaymentStatus {
  Pending = 'pending',
  Successful = 'successful',
  Failed = 'failed',
  Refunded = 'refunded',
}

export enum PayoutRequestStatus {
  Pending = 'pending',
  Transferred = 'transferred',
  Rejected = 'rejected',
}

export enum PurchaseOrderStatus {
  Pending = 'pending',
  Received = 'received',
}

export enum RefundRequestStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Processed = 'processed',
}

export enum RefundResolution {
  WalletCredit = 'wallet_credit',
  GatewayRefund = 'gateway_refund',
}

export enum SettlementStatus {
  Pending = 'pending',
  Completed = 'completed',
  Disputed = 'disputed',
}

export enum SettlementType {
  Courier = 'courier',
  Vendor = 'vendor',
}

export enum SocialProvider {
  Google = 'google',
  Facebook = 'facebook',
  Apple = 'apple',
}

export enum StockMovementType {
  Sale = 'sale',
  Purchase = 'purchase',
  Return = 'return',
  Adjustment = 'adjustment',
}

export enum SubOrderStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Preparing = 'preparing',
  ReadyForPickup = 'ready_for_pickup',
}

export enum UnitType {
  Piece = 'piece',
  Kg = 'kg',
  Gram = 'gram',
  Portion = 'portion',
}

export enum VehicleType {
  Motorcycle = 'motorcycle',
  Bicycle = 'bicycle',
  Car = 'car',
}

export enum VendorStatus {
  ONLINE = 'online',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

export enum VendorType {
  RESTAURANT = 'restaurant',
  GROCERY = 'grocery',
  PHARMACY = 'pharmacy',
}

export enum WalletTransactionType {
  Deposit = 'deposit',
  Withdrawal = 'withdrawal',
  Refund = 'refund',
  DeliveryEarning = 'delivery_earning',
  CommissionEarning = 'commission_earning',
  CodDeduction = 'cod_deduction',
  PayoutWithdrawal = 'payout_withdrawal',
}

