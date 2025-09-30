import { apiFetch } from "./api";
import { ENDPOINTS } from "./endpoints";

export const deleteTenantDocument = async (documentId: number): Promise<void> => {
  await apiFetch(ENDPOINTS.tenantDocuments.delete(documentId), {
    method: "DELETE",
  });
};
