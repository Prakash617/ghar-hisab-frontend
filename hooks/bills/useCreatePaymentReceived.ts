import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { createPaymentReceived, PaymentReceived, PaymentReceivedPayload } from "@/lib/payment-received";

export function useCreatePaymentReceived() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentReceivedPayload) => createPaymentReceived(payload),
    onMutate: async (newPayment) => {
      const tenantId = newPayment.tenant;
      const tenantPaymentsQueryKey = queryKeys.paymentReceived(tenantId);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: tenantPaymentsQueryKey });

      // Snapshot the previous value
      const previousTenantPayments = queryClient.getQueryData<PaymentReceived[]>(tenantPaymentsQueryKey);

      // Optimistically update to the new value
      if (previousTenantPayments) {
        queryClient.setQueryData<PaymentReceived[]>(tenantPaymentsQueryKey, [
          {
            ...newPayment,
            id: Math.random().toString(), // Temporary ID
            created_at: new Date().toISOString(),
            status: "Unpaid", // Default status
            tenant_id: tenantId,
            total_amount_due: 0, // Will be calculated by backend
            remaining_amount: newPayment.amount, // Will be calculated by backend
          },
          ...previousTenantPayments,
        ]);
      }

      // Return a context object with the snapshotted value
      return { previousTenantPayments, tenantPaymentsQueryKey };
    },
    onError: (err, newPayment, context) => {
      if (context?.previousTenantPayments) {
        queryClient.setQueryData<PaymentReceived[]>(context.tenantPaymentsQueryKey, context.previousTenantPayments);
      }
    },
    onSettled: (data, error, variables, context) => {
      if (context?.tenantPaymentsQueryKey) {
        queryClient.invalidateQueries({ queryKey: context.tenantPaymentsQueryKey });
      }
    },
  });
}