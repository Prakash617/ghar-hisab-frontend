"use client";

import React from 'react';
import { useGetRoomsByHouseId } from "@/hooks/rooms/useGetRoomsByHouseId";
import { Room } from "@/lib/types";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function RoomsPage({ params }: { params: { houseId: string } }) {
  const { houseId } = React.use(params);
  const { data: rooms, isLoading, isError } = useGetRoomsByHouseId(houseId);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        }
        </div>
      </div>
    );
  }

  if (isError) {
    return <div>Error fetching rooms</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Rooms</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms?.map((room: Room) => (
          <Link href={`/dashboard/bills/${room.id}`} key={room.id}>
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold">{room.room_number}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
