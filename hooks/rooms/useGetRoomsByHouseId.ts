import { useQuery } from "@tanstack/react-query";
import { getRoomsByHouseId } from "@/lib/rooms";
import { queryKeys } from "@/lib/query-keys";

export function useGetRoomsByHouseId(houseId: string) {
  return useQuery({
    queryKey: queryKeys.roomsByHouseId(houseId),
    queryFn: () => getRoomsByHouseId(houseId),
    enabled: !!houseId,
  });
}
