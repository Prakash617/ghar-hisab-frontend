"use client";

import React from 'react';
import { useGetRoomsByHouseId } from "@/hooks/rooms/useGetRoomsByHouseId";
import { Room } from "@/lib/types";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { AddRoomModal } from "@/components/room/AddRoomModal";
import { Button } from '@/components/ui/button';
import { useDeleteRoom } from '@/hooks/rooms/useDeleteRoom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function RoomsPage({ params }: { params: { houseId: string } }) {
  const { houseId } = params;
  const { data: rooms, isLoading, isError } = useGetRoomsByHouseId(houseId);
  const { mutate: deleteRoom } = useDeleteRoom(houseId);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Rooms</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return <div>Error fetching rooms</div>;
  }

  const handleDelete = (roomId: string) => {
    deleteRoom(roomId);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <AddRoomModal houseId={parseInt(houseId, 10)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms?.map((room: Room) => (
          <div key={room.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow flex justify-between items-center">
            <Link href={`/dashboard/bills/${room.id}`} >
              <h2 className="text-xl font-semibold">{room.room_number}</h2>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the room.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(String(room.id))}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );
}
