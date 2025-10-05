import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRoom } from "@/lib/rooms";
import { queryKeys } from "@/lib/query-keys";
import { useToast } from "@/components/ui/use-toast";

export function useDeleteRoom(houseId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roomsByHouseId(houseId) });
      queryClient.refetchQueries({ queryKey: queryKeys.roomsByHouseId(houseId) });
      toast({
        title: "Success",
        description: "Room deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete room.",
        variant: "destructive",
      });
    },
  });
}
