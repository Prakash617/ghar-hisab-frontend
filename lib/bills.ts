import { apiFetch } from "./api";
import { ENDPOINTS } from "./endpoints";
import { PaymentHistory } from "./types";

export interface PaymentHistoryPayload {
  room: number;
  month: string;
  previousUnits: number;
  currentUnits: number;
  electricity: number;
  water: number;
  rent: number;
  total: number;
  status: string;
}

export const getBillDetails = async (roomId: string): Promise<PaymentHistory[]> => {
  const data = await apiFetch(`${ENDPOINTS.paymentHistories.list}?room_id=${roomId}`);
  return data;
};

export const createPaymentHistory = async (payload: PaymentHistoryPayload): Promise<PaymentHistory> => {
  const response = await apiFetch(ENDPOINTS.paymentHistories.create, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response;
};
