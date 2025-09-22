import { useQuery } from "@tanstack/react-query";
import { getBillDetails } from "@/lib/bills";
import { queryKeys } from "@/lib/query-keys";

export function useGetBillDetails(roomId: string) {
  return useQuery({
    queryKey: queryKeys.billDetails(roomId),
    queryFn: () => getBillDetails(roomId),
    enabled: !!roomId,
  });
}
