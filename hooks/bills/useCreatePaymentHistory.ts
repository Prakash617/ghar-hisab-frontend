import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPaymentHistory, PaymentHistoryPayload } from "@/lib/bills";
import { queryKeys } from "@/lib/query-keys";

export function useCreatePaymentHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentHistoryPayload) => createPaymentHistory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentHistories });
    },
  });
}
