import { apiFetch } from "./api";
import { ENDPOINTS } from "./endpoints";
import { PaymentHistory, BillItem } from "./types"; // Import BillItem if needed for fromApiPaymentHistory

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

// Define the ApiPaymentHistory type as it's expected from the backend API response
type ApiPaymentHistory = {
  id: number;
  room: number;
  month: string;
  previous_units: number;
  current_units: number;
  electricity: { amount: number; status: string; }; // Updated to match server response
  water: { amount: number; status: string; };     // Updated to match server response
  rent: { amount: number; status: string; };       // Updated to match server response
  total: { amount: number; status: string; };      // Updated to match server response
  status: "Paid" | "Unpaid" | "Partial";
};

// Helper function to transform ApiPaymentHistory to PaymentHistory
const fromApiPaymentHistory = (apiPaymentHistory: ApiPaymentHistory): PaymentHistory => {
  return {
    id: apiPaymentHistory.id,
    roomId: apiPaymentHistory.room,
    month: apiPaymentHistory.month,
    previousUnits: apiPaymentHistory.previous_units,
    currentUnits: apiPaymentHistory.current_units,
    electricity: { amount: apiPaymentHistory.electricity.amount, status: apiPaymentHistory.electricity.status as "Paid" | "Unpaid" },
    water: { amount: apiPaymentHistory.water.amount, status: apiPaymentHistory.water.status as "Paid" | "Unpaid" },
    rent: { amount: apiPaymentHistory.rent.amount, status: apiPaymentHistory.rent.status as "Paid" | "Unpaid" },
    total: apiPaymentHistory.total.amount,
    status: apiPaymentHistory.status,
  };
};

// Define the payload type for the API when creating a payment history
type ApiPaymentHistoryCreatePayload = {
  room: number;
  month: string;
  previous_units: number;
  current_units: number;
  electricity: number;
  water: number;
  rent: number;
  total: number;
  status: string;
};

// Helper function to transform PaymentHistoryPayload to ApiPaymentHistoryCreatePayload
const toApiPaymentHistoryCreatePayload = (payload: PaymentHistoryPayload): ApiPaymentHistoryCreatePayload => {
  return {
    room: payload.room,
    month: payload.month,
    previous_units: payload.previousUnits,
    current_units: payload.currentUnits,
    electricity: payload.electricity,
    water: payload.water,
    rent: payload.rent,
    total: payload.total,
    status: payload.status,
  };
};

export const getBillDetails = async (roomId: string): Promise<PaymentHistory[]> => {
  const data: ApiPaymentHistory[] = await apiFetch(`${ENDPOINTS.paymentHistories.list}?room_id=${roomId}`);
  return data.map(fromApiPaymentHistory);
};

export const createPaymentHistory = async (payload: PaymentHistoryPayload): Promise<PaymentHistory> => {
  const apiFormattedPayload = toApiPaymentHistoryCreatePayload(payload);
  const response = await apiFetch(ENDPOINTS.paymentHistories.create, {
    method: "POST",
    body: JSON.stringify(apiFormattedPayload),
  });
  // Assuming the backend returns ApiPaymentHistory, convert it
  return fromApiPaymentHistory(response);
};
