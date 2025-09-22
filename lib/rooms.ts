import { apiFetch } from "./api";
import { ENDPOINTS } from "./endpoints";
import { Room } from "./types";

export const getRoomsByHouseId = async (houseId: string): Promise<Room[]> => {
  const data = await apiFetch(`${ENDPOINTS.rooms.list}?house_id=${houseId}`);
  return data;
};

export const getAllRooms = async (): Promise<Room[]> => {
  const data = await apiFetch(ENDPOINTS.rooms.list);
  return data;
};
