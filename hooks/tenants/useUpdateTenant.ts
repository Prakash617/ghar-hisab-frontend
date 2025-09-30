import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTenant } from "@/lib/tenants";
import { queryKeys } from "@/lib/query-keys";
import { Tenant } from "@/lib/types";

export function useUpdateTenant(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, tenantData }: { tenantId: number; tenantData: Partial<Tenant> }) => updateTenant(tenantId, tenantData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantByRoomId(roomId) });
    },
  });
}
