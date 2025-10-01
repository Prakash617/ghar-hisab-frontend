import { apiFetch } from "./api";
import { ENDPOINTS } from "./endpoints";
import { PaymentHistory } from "./types";

export interface PaymentHistoryPayload {
  room: number;
  billing_month: string;
  previous_units: number;
  current_units: number;
  electricity?: number;
  water?: number;
  rent?: number;
  waste?: number;
}

export const getBillDetails = async (roomId: string): Promise<PaymentHistory[]> => {
  const data: PaymentHistory[] = await apiFetch(`${ENDPOINTS.paymentHistories.list}?room_id=${roomId}`);
  return data;
};

export const createPaymentHistory = async (payload: PaymentHistoryPayload): Promise<PaymentHistory> => {
  const response = await apiFetch(ENDPOINTS.paymentHistories.create, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response;
};

export const getPaymentHistories = async (): Promise<PaymentHistory[]> => {
  const data: PaymentHistory[] = await apiFetch(ENDPOINTS.paymentHistories.list);
  return data;
};
