import {
  ExecutionMethod,
  PayoutRequestStatus,
  SettlementStatus,
  SettlementType,
  WalletTransactionType,
} from './enums';
import { Courier } from './courier';
import { Vendor } from './vendor';

export interface PlatformMetrics {
  total_revenue: string;
  current_balance: string;
}

export interface CommissionMetrics {
  total_count: number;
  total_platform_profit: string;
  total_vendorcommission: string;
  total_delivery_share: string;
}

export interface CashMetrics {
  unsettled_total: string;
  unsettled_count: number;
  total_collected: string;
}

export interface PayoutMetrics {
  pending_count: number;
  pending_total: string;
  transferred_total: string;
}

export interface SettlementMetrics {
  pending_count: number;
  pending_total: string;
  completed_count: number;
}

export interface FinanceOverview {
  platform: PlatformMetrics;
  commissions: CommissionMetrics;
  cash: CashMetrics;
  payouts: PayoutMetrics;
  settlements: SettlementMetrics;
}

export interface SettlementItem {
  id: number;
  settlement_id: number;
  reference_type: string;
  reference_id: number;
  amount: string;
  created_at: string;
  updated_at: string;
}

export interface SettlementExecution {
  id: number;
  settlement_id: number;
  admin_id: number;
  execution_method: ExecutionMethod;
  executed_at: string;
  created_at: string;
  updated_at: string;
}

export interface SettlementNote {
  id: number;
  settlement_id: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Settlement {
  id: number;
  settlement_type: SettlementType;
  target_id: number;
  period_start: string;
  period_end: string;
  total_gross: string;
  total_deductions: string;
  total_net_exchange: string;
  status: SettlementStatus;
  created_at: string;
  updated_at: string;
  target_entity?: Courier | Vendor; // Returned dynamically by backend
  items?: SettlementItem[];
  execution?: SettlementExecution;
  note?: SettlementNote;
}

export interface PayoutRequest {
  id: number;
  user_id: number;
  amount: string;
  bank_details: string;
  status: PayoutRequestStatus;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  execution?: {
    id: number;
    admin_id: number;
    executed_at: string;
  };
}

export interface SettlementFilterDTO {
  settlement_type?: SettlementType | '';
  status?: SettlementStatus | '';
  cursor?: string;
}

export interface PayoutRequestFilterDTO {
  status?: PayoutRequestStatus | '';
  cursor?: string;
}

export interface ExecuteSettlementDTO {
  execution_method: ExecutionMethod;
  notes?: string;
}
