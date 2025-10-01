import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ENDPOINTS } from "@/lib/endpoints";
import { PaymentStatus } from "@/lib/types";

interface UpdateBillItemPayload {
  paymentId: number;
  itemType: 'electricity' | 'water' | 'rent' | 'waste';
  itemData: {
    amount: string;
    paid: string;
    status: PaymentStatus;
  };
}

export const useUpdateBillItem = (billId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentId, itemType, itemData }: UpdateBillItemPayload) => {
      const payload = {
        [itemType]: itemData.amount,
        [`${itemType}_paid`]: itemData.paid,
        [`${itemType}_status`]: itemData.status,
      };
      
      console.log("Sending PATCH payload:", payload);
      console.log("Sending PATCH to URL:", ENDPOINTS.paymentHistories.detail(paymentId));
      
      return apiFetch(ENDPOINTS.paymentHistories.detail(paymentId), {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data) => {
      console.log("Bill item updated successfully:", data);
    },
    onError: (error) => {
      console.error("Error updating bill item:", error);
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
