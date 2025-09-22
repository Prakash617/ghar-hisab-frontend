"use client";

import { useGetHouses } from "@/hooks/houses/useGetHouses";
import { House } from "@/lib/types";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function HousesPage() {
  const { data: houses, isLoading, isError } = useGetHouses();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">My Houses</h1>
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
    return <div>Error fetching houses</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Houses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {houses?.map((house: House) => (
          <Link href={`/dashboard/houses/${house.id}/rooms`} key={house.id}>
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold">{house.name}</h2>
              <p className="text-gray-500">{house.address}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
