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

      // Create a new payment history entry
      const newPaymentHistory: PaymentHistory = {
        id: Math.random(), // Temporary ID
        ...newPayment,
        created_at: new Date().toISOString(),
      };

      // Optimistically update to the new value
      if (previousPaymentHistories) {
        queryClient.setQueryData<PaymentHistory[]>(
          queryKeys.paymentHistories,
          [newPaymentHistory, ...previousPaymentHistories]
        );
      }
      if (previousBillDetails) {
        queryClient.setQueryData<PaymentHistory[]>(
          billDetailsQueryKey,
          [newPaymentHistory, ...previousBillDetails]
        );
      }

      // Return a context object with the snapshotted value
      return { previousPaymentHistories, previousBillDetails, billDetailsQueryKey };
    },
    onError: (err, newPayment, context) => {
      if (context?.previousPaymentHistories) {
        queryClient.setQueryData<PaymentHistory[]>(
          queryKeys.paymentHistories,
          context.previousPaymentHistories
        );
      }
      if (context?.previousBillDetails && context?.billDetailsQueryKey) {
        queryClient.setQueryData<PaymentHistory[]>(
          context.billDetailsQueryKey,
          context.previousBillDetails
        );
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
