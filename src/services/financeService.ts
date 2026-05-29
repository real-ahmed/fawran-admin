import api from '@/config/axios';
import type { CursorPaginatedResponse } from '@/utils/pagination';
import type {
  ExecuteSettlementDTO,
  FinanceOverview,
  PayoutRequest,
  PayoutRequestFilterDTO,
  Settlement,
  SettlementFilterDTO,
} from '@/types/finance';

const BASE_PATH = '/admin';

export const financeService = {
  // --------------------------------------------------------
  // Overview
  // --------------------------------------------------------
  getOverview: async (): Promise<FinanceOverview> => {
    const { data } = await api.get<{ data: FinanceOverview }>(`${BASE_PATH}/finances/overview`);
    return data.data; // usually wrapped in data
  },

  // --------------------------------------------------------
  // Settlements
  // --------------------------------------------------------
  getSettlements: async (
    params: SettlementFilterDTO
  ): Promise<CursorPaginatedResponse<Settlement>> => {
    const { data } = await api.get<CursorPaginatedResponse<Settlement>>(
      `${BASE_PATH}/settlements`,
      { params }
    );
    return data;
  },

  getSettlement: async (id: number): Promise<Settlement> => {
    const { data } = await api.get<{ data: Settlement }>(`${BASE_PATH}/settlements/${id}`);
    return data.data;
  },

  executeSettlement: async (
    id: number,
    payload: ExecuteSettlementDTO
  ): Promise<Settlement> => {
    const { data } = await api.post<{ data: Settlement }>(
      `${BASE_PATH}/settlements/${id}/execute`,
      payload
    );
    return data.data;
  },

  // --------------------------------------------------------
  // Payout Requests
  // --------------------------------------------------------
  getPayoutRequests: async (
    params: PayoutRequestFilterDTO
  ): Promise<CursorPaginatedResponse<PayoutRequest>> => {
    const { data } = await api.get<CursorPaginatedResponse<PayoutRequest>>(
      `${BASE_PATH}/payout-requests`,
      { params }
    );
    return data;
  },

  approvePayout: async (id: number): Promise<PayoutRequest> => {
    const { data } = await api.put<{ data: PayoutRequest }>(
      `${BASE_PATH}/payout-requests/${id}/approve`
    );
    return data.data;
  },

  rejectPayout: async (id: number): Promise<PayoutRequest> => {
    const { data } = await api.put<{ data: PayoutRequest }>(
      `${BASE_PATH}/payout-requests/${id}/reject`
    );
    return data.data;
  },
};
