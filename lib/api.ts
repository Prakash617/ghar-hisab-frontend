import { ENDPOINTS } from "./endpoints";
import { PaymentHistory } from "./types";

type ApiPaymentHistory = {
  id: number;
  month: string;
  previous_units: number;
  current_units: number;
  electricity: string;
  water: string;
  rent: string;
  total: string;
  status: "Paid" | "Unpaid" | "Partial";
  room: number;
};

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("access");

  const response = await fetch(`${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export const getPaymentHistories = async (): Promise<PaymentHistory[]> => {
  const data: ApiPaymentHistory[] = await apiFetch(`${ENDPOINTS.bills.paymentHistories}`);
  return data.map((item) => ({
    id: item.id,
    month: item.month,
    previousUnits: item.previous_units,
    currentUnits: item.current_units,
    electricity: { amount: parseFloat(item.electricity), status: "Paid" }, // Assuming status based on overall status
    water: { amount: parseFloat(item.water), status: "Paid" },
    rent: { amount: parseFloat(item.rent), status: "Paid" },
    total: parseFloat(item.total),
    status: item.status,
    room: item.room,
  }));
};
