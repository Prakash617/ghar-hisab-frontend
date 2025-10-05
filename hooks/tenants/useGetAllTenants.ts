import { useQuery } from "@tanstack/react-query";
import { getAllTenants } from "@/lib/tenants";
import { queryKeys } from "@/lib/query-keys";

export function useGetAllTenants() {
  return useQuery({
    queryKey: queryKeys.tenants,
    queryFn: getAllTenants,
  });
}
