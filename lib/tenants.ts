import { apiFetch } from "./api";
import { ENDPOINTS } from "./endpoints";
import { Tenant } from "./types";

export const getTenantByRoomId = async (roomId: string): Promise<Tenant> => {
  const data = await apiFetch(`${ENDPOINTS.tenants.list}?room_id=${roomId}`);
  return data[0]; // Assuming the API returns an array and we need the first tenant
};
