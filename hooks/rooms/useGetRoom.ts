import { useQuery } from "@tanstack/react-query";
import { getRoom } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useGetRoom(roomId: string) {
  return useQuery({
    queryKey: [queryKeys.rooms, roomId],
    queryFn: () => getRoom(roomId),
  });
}
