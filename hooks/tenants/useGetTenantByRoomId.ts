import { useQuery } from "@tanstack/react-query";
import { getTenantByRoomId } from "@/lib/tenants";
import { queryKeys } from "@/lib/query-keys";

export function useGetTenantByRoomId(roomId: string) {
  return useQuery({
    queryKey: queryKeys.tenantByRoomId(roomId),
    queryFn: () => getTenantByRoomId(roomId),
    enabled: !!roomId,
  });
}
