import { apiFetch } from "./api";
import { ENDPOINTS } from "./endpoints";
import { House } from "./types";

export const getHouses = async (): Promise<House[]> => {
  const data = await apiFetch(ENDPOINTS.houses.list);
  return data;
};
