import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { PaymentHistory } from "@/lib/types";
import { ENDPOINTS } from "@/lib/endpoints";

// Define the ApiPaymentHistory type as it's expected by the backend for updates
type ApiPaymentHistory = {
  id: number;
  room: number;
  billing_month: string;
  previous_units: number;
  current_units: number;
  electricity: { amount: number; status: "Paid" | "Unpaid" | "Partially Paid"; }; // Updated to object
  water: { amount: number; status: "Paid" | "Unpaid" | "Partially Paid"; };     // Updated to object
  rent: { amount: number; status: "Paid" | "Unpaid" | "Partially Paid"; };       // Updated to object
  // total is optional and recalculated by backend, so we remove it from the payload type
  status: "Paid" | "Unpaid" | "Partially Paid";
};

// Helper function to transform PaymentHistory to ApiPaymentHistory
const toApiPaymentHistory = (paymentHistory: PaymentHistory): ApiPaymentHistory => {
  return {
    id: paymentHistory.id,
    room: paymentHistory.roomId,
    billing_month: paymentHistory.billing_month,
    previous_units: paymentHistory.previous_units,
    current_units: paymentHistory.current_units,
    electricity: { amount: parseFloat(paymentHistory.electricity), status: paymentHistory.electricity_status },
    water: { amount: parseFloat(paymentHistory.water), status: paymentHistory.water_status },
    rent: { amount: parseFloat(paymentHistory.rent), status: paymentHistory.rent_status },
    // total is removed as per backend specification for update payload
    status: paymentHistory.status,
  };
};

export const useUpdatePaymentHistory = (billId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentHistory: PaymentHistory) => {
      const apiFormattedPaymentHistory = toApiPaymentHistory(paymentHistory);
      console.log("Sending update payload:", apiFormattedPaymentHistory);
      return apiFetch(ENDPOINTS.paymentHistories.detail(apiFormattedPaymentHistory.id), {
        method: 'PUT',
        body: JSON.stringify(apiFormattedPaymentHistory),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.billDetails(billId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.paymentHistories,
      });
    },
  });
};