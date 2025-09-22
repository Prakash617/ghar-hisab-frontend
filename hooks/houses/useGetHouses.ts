import { useQuery } from "@tanstack/react-query";
import { getHouses } from "@/lib/houses";
import { queryKeys } from "@/lib/query-keys";

export function useGetHouses() {
  return useQuery({
    queryKey: queryKeys.houses,
    queryFn: getHouses,
  });
}
