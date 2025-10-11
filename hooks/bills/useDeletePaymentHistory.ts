import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ENDPOINTS } from "@/lib/endpoints";

export const useDeletePaymentHistory = (billId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentHistoryId: string) => {
      return apiFetch(ENDPOINTS.paymentHistories.detail(paymentHistoryId), { method: 'DELETE' });
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