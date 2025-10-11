import { useMutation } from "@tanstack/react-query";
import { deletePaymentReceived } from "@/lib/payment-received";

export function useDeletePaymentHistory() {
  return useMutation({
    mutationFn: (paymentId: string) => deletePaymentReceived(paymentId),
  });
}
