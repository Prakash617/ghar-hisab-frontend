import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { BillItem } from "@/lib/types";
import { ENDPOINTS } from "@/lib/endpoints";

interface UpdateBillItemPayload {
  paymentId: number;
  itemType: 'electricity' | 'water' | 'rent';
  updatedItem: BillItem;
}

type PatchPayload = {
    rent?: number;
    rent_status?: string;
    electricity?: { amount: number; status: string };
    water?: { amount: number; status: string };
}

export const useUpdateBillItem = (billId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentId, itemType, updatedItem }: UpdateBillItemPayload) => {
      let payload: PatchPayload;
      if (itemType === 'rent') {
        payload = {
          rent: updatedItem.amount,
          rent_status: updatedItem.status,
        };
      } else {
        payload = {
          [itemType]: { amount: updatedItem.amount, status: updatedItem.status },
        };
      }
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
