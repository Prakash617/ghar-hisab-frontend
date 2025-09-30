import { apiFetchWithProgress } from "./api-progress";
import { ENDPOINTS } from "./endpoints";

export const uploadTenantDocumentWithProgress = async (tenantId: number, document: File, onProgress: (progress: number) => void): Promise<unknown> => {
  const formData = new FormData();
  formData.append("tenant", tenantId.toString());
  formData.append("document", document);

  const response = await apiFetchWithProgress(ENDPOINTS.tenantDocuments.create, {
    method: "POST",
    body: formData,
    onProgress,
  });
  return response;
};
