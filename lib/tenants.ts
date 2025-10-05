import { apiFetch } from "./api";
import { ENDPOINTS } from "./endpoints";
import { Tenant } from "./types";

export const getAllTenants = async (): Promise<Tenant[]> => {
  const data = await apiFetch(ENDPOINTS.tenants.list);
  return data;
};

export const getTenantByRoomId = async (roomId: string): Promise<Tenant> => {
  console.log("Fetching tenant for roomId:", roomId);
  const data = await apiFetch(`${ENDPOINTS.tenants.list}?room_id=${roomId}`);
  return data[0]; // Assuming the API returns an array and we need the first tenant
};

export const updateTenant = async (tenantId: number, tenantData: Partial<Tenant>): Promise<Tenant> => {
  const response = await apiFetch(ENDPOINTS.tenants.detail(tenantId), {
    method: "PATCH",
    body: JSON.stringify(tenantData),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
};
