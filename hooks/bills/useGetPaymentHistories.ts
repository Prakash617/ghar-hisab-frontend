import { useQuery } from "@tanstack/react-query";
import { getPaymentHistories } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useGetPaymentHistories() {
  return useQuery({
    queryKey: queryKeys.paymentHistories,
    queryFn: getPaymentHistories,
  });
}
