import { useQuery } from "@tanstack/react-query";
import { getAllRooms } from "@/lib/rooms";
import { queryKeys } from "@/lib/query-keys";

export function useGetAllRooms() {
  return useQuery({
    queryKey: queryKeys.allRooms,
    queryFn: getAllRooms,
  });
}
