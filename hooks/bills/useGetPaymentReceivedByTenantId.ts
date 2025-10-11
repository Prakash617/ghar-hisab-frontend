import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getPaymentReceivedByTenantId } from "@/lib/payment-received";

export function useGetPaymentReceivedByTenantId(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.paymentReceived(tenantId),
    queryFn: async () => {
      const data = await getPaymentReceivedByTenantId(tenantId);
      return data;
    },
    enabled: !!tenantId,
  });
}
