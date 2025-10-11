import { API_BASE } from "./endpoints";
import { apiFetch } from "./api";

export interface PaymentReceivedPayload {
  tenant: string;
  amount: number;
  received_date: string;
  remarks?: string;
}

export interface PaymentReceived {
  id: string;
  tenant_id: string;
  amount: number;
  received_date: string;
  remarks?: string;
  status: "Paid" | "Partially Paid" | "Unpaid" | "Overpaid";
  created_at: string;
  total_amount_due: number;
  remaining_amount: number;
}

export async function createPaymentReceived(payload: PaymentReceivedPayload): Promise<PaymentReceived> {
  const response = await apiFetch(`${API_BASE}/api/payment-received/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response;
}

export async function getPaymentReceivedByTenantId(tenantId: string): Promise<PaymentReceived[]> {
  try {
    const data = await apiFetch(`${API_BASE}/api/payment-received/?tenant_id=${tenantId}`);
    return data;
  } catch (error) {
    console.error("Error in getPaymentReceivedByTenantId:", error);
    throw error;
  }
}

export async function updatePaymentReceived(paymentId: string, payload: Partial<PaymentReceivedPayload>): Promise<PaymentReceived> {
  const response = await apiFetch(`${API_BASE}/api/payment-received/${paymentId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return response;
}

export async function deletePaymentReceived(paymentId: string): Promise<void> {
  await apiFetch(`${API_BASE}/api/payment-received/${paymentId}/`, {
    method: "DELETE",
  });
}
