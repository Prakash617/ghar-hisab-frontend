import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteHouse } from "@/lib/houses";
import { queryKeys } from "@/lib/query-keys";
import { useToast } from "@/components/ui/use-toast";

export function useDeleteHouse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteHouse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.houses() });
      queryClient.refetchQueries({ queryKey: queryKeys.houses() });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete house.",
        variant: "destructive",
      });
    },
  });
}
