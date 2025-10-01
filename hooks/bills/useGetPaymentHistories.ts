import { useQuery } from "@tanstack/react-query";
import { getPaymentHistories } from "@/lib/bills";
import { queryKeys } from "@/lib/query-keys";

export function useGetPaymentHistories() {
  return useQuery({
    queryKey: queryKeys.paymentHistories,
    queryFn: getPaymentHistories,
  });
}
