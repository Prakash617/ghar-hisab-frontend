import { apiFetch } from "./api";
import { ENDPOINTS } from "./endpoints";
import { Room, Tenant, TenantData } from "./types";

export const getRoomsByHouseId = async (houseId: string): Promise<Room[]> => {
  const data = await apiFetch(`${ENDPOINTS.rooms.list}?house_id=${houseId}`);
  return data;
};

export const getAllRooms = async (): Promise<Room[]> => {
  const data = await apiFetch(ENDPOINTS.rooms.list);
  return data;
};

export const createRoomWithTenant = async (roomData: { room_number: string; house: number; tenant: TenantData }): Promise<{room: Room, tenant: Tenant}> => {
  const response = await apiFetch(ENDPOINTS.rooms.createWithTenant, {
    method: "POST",
    body: JSON.stringify(roomData),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
};

export const deleteRoom = async (roomId: string): Promise<void> => {
    await apiFetch(ENDPOINTS.rooms.detail(roomId), {
        method: "DELETE",
    });
};
