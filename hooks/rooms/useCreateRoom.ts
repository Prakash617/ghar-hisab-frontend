import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRoomWithTenant } from "@/lib/rooms";
import { queryKeys } from "@/lib/query-keys";
import { useToast } from "@/components/ui/use-toast";

export function useCreateRoom(houseId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createRoomWithTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roomsByHouseId(houseId) });
      toast({
        title: "Success",
        description: "Room created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create room.",
        variant: "destructive",
      });
    },
  });
}
