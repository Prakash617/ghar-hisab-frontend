import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadTenantDocumentWithProgress } from "@/lib/tenant-documents-progress";
import { queryKeys } from "@/lib/query-keys";

export const useUploadTenantDocumentWithProgress = (roomId: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    {
      mutationFn: ({ tenantId, document, onProgress }: { tenantId: number; document: File; onProgress: (progress: number) => void }) =>
        uploadTenantDocumentWithProgress(tenantId, document, onProgress),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.tenantByRoomId(roomId) });
      },
    }
  );
};