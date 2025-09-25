import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { PaymentHistory } from "@/lib/types";
import { ENDPOINTS } from "@/lib/endpoints";

// Define the ApiPaymentHistory type as it's expected by the backend for updates
type ApiPaymentHistory = {
  id: number;
  room: number;
  month: string;
  previous_units: number;
  current_units: number;
  electricity: { amount: number; status: "Paid" | "Unpaid" | "Partial"; }; // Updated to object
  water: { amount: number; status: "Paid" | "Unpaid" | "Partial"; };     // Updated to object
  rent: { amount: number; status: "Paid" | "Unpaid" | "Partial"; };       // Updated to object
  // total is optional and recalculated by backend, so we remove it from the payload type
  status: "Paid" | "Unpaid" | "Partial";
};

// Helper function to transform PaymentHistory to ApiPaymentHistory
const toApiPaymentHistory = (paymentHistory: PaymentHistory): ApiPaymentHistory => {
  return {
    id: paymentHistory.id,
    room: paymentHistory.roomId,
    month: paymentHistory.month,
    previous_units: paymentHistory.previousUnits,
    current_units: paymentHistory.currentUnits,
    electricity: { amount: paymentHistory.electricity.amount, status: paymentHistory.electricity.status },
    water: { amount: paymentHistory.water.amount, status: paymentHistory.water.status },
    rent: { amount: paymentHistory.rent.amount, status: paymentHistory.rent.status },
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