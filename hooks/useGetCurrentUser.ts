import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/auth";
import { queryKeys } from "@/lib/query-keys";

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
  });
};
