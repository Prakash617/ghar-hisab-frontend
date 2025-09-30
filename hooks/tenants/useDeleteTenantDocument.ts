import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTenantDocument } from "@/lib/tenant-documents";
import { queryKeys } from "@/lib/query-keys";

export const useDeleteTenantDocument = (roomId: string, onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: number) => deleteTenantDocument(documentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tenantByRoomId(roomId) });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
};
