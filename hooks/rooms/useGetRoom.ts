import { useQuery } from "@tanstack/react-query";
import { getRoom } from "@/lib/rooms";
import { queryKeys } from "@/lib/query-keys";

export function useGetRoom(roomId: string) {
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: () => getRoom(roomId),
  });
}
