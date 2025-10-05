import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createHouse } from "@/lib/houses";
import { queryKeys } from "@/lib/query-keys";
import { useToast } from "@/components/ui/use-toast";

export function useCreateHouse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createHouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.houses });
      toast({
        title: "Success",
        description: "House created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create house.",
        variant: "destructive",
      });
    },
  });
}
