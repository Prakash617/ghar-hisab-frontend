import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePaymentReceived, PaymentReceivedPayload } from "@/lib/payment-received";
import { queryKeys } from "@/lib/query-keys";

interface UpdatePaymentArgs {
  paymentId: string;
  payload: Partial<PaymentReceivedPayload>;
}

export function useUpdatePaymentReceived(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, payload }: UpdatePaymentArgs) =>
      updatePaymentReceived(paymentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.paymentReceived(tenantId),
      });
    },
  });
}
