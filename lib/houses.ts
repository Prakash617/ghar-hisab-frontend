import { apiFetch } from "./api";
import { ENDPOINTS } from "./endpoints";
import { House } from "./types";

export const getHouses = async (): Promise<House[]> => {
  const data = await apiFetch(ENDPOINTS.houses.list);
  return data;
};

export const createHouse = async (houseData: { name: string; address: string; owner: number }): Promise<House> => {
  const response = await apiFetch(ENDPOINTS.houses.list, {
    method: "POST",
    body: JSON.stringify(houseData),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
};

export const deleteHouse = async (houseId: string): Promise<{ message: string }> => {
    const response = await apiFetch(ENDPOINTS.houses.detail(houseId), {
        method: "DELETE",
    });
    return response;
};
