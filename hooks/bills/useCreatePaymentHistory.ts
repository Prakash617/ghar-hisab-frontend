import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPaymentHistory, PaymentHistoryPayload } from "@/lib/bills";
import { queryKeys } from "@/lib/query-keys";
import { PaymentHistory } from "@/lib/types";

export function useCreatePaymentHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentHistoryPayload) => createPaymentHistory(payload),
    onMutate: async (newPayment) => {
      const { room: roomId } = newPayment;
      const billDetailsQueryKey = queryKeys.billDetails(roomId.toString());

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.paymentHistories });
      await queryClient.cancelQueries({ queryKey: billDetailsQueryKey });

      // Snapshot the previous value
      const previousPaymentHistories = queryClient.getQueryData<PaymentHistory[]>(queryKeys.paymentHistories);
      const previousBillDetails = queryClient.getQueryData<PaymentHistory[]>(billDetailsQueryKey);

      // Create a new payment history entry with all required fields
      const newPaymentHistory: PaymentHistory = {
        id: Math.random(), // Temporary ID
        roomId: newPayment.room, // Use room from newPayment
        billing_month: newPayment.billing_month,
        previous_units: newPayment.previous_units,
        current_units: newPayment.current_units,
        electricity: newPayment.electricity?.toString() || "0",
        electricity_paid: "0",
        electricity_status: "Unpaid",
        electricity_updated_at: null,
        water: newPayment.water?.toString() || "0",
        water_paid: "0",
        water_status: "Unpaid",
        water_updated_at: null,
        rent: newPayment.rent?.toString() || "0",
        rent_paid: "0",
        rent_status: "Unpaid",
        rent_updated_at: null,
        waste: newPayment.waste?.toString() || "0",
        waste_paid: "0",
        waste_status: "Unpaid",
        waste_updated_at: null,
        total: "0", // Will be calculated by backend
        total_paid: "0",
        status: "Unpaid",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Optimistically update to the new value
      if (previousPaymentHistories) {
        queryClient.setQueryData<PaymentHistory[]>(queryKeys.paymentHistories, [newPaymentHistory, ...previousPaymentHistories]);
      }
      if (previousBillDetails) {
        queryClient.setQueryData<PaymentHistory[]>(billDetailsQueryKey, [newPaymentHistory, ...previousBillDetails]);
      }

      // Return a context object with the snapshotted value
      return { previousPaymentHistories, previousBillDetails, billDetailsQueryKey };
    },
    onError: (err, newPayment, context) => {
      if (context?.previousPaymentHistories) {
        queryClient.setQueryData<PaymentHistory[]>(queryKeys.paymentHistories, context.previousPaymentHistories);
      }
      if (context?.previousBillDetails && context?.billDetailsQueryKey) {
        queryClient.setQueryData<PaymentHistory[]>(context.billDetailsQueryKey, context.previousBillDetails);
      }
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentHistories });
      if (context?.billDetailsQueryKey) {
        queryClient.invalidateQueries({ queryKey: context.billDetailsQueryKey });
      }
    },
  });
}