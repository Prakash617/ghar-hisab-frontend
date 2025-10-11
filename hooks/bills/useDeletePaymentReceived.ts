import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { deletePaymentReceived } from "@/lib/payment-received";

export function useDeletePaymentReceived(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => deletePaymentReceived(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.paymentReceived(tenantId),
      });
    },
  });
}
