"use client";

import { useGetHouses } from "@/hooks/houses/useGetHouses";
import { House } from "@/lib/types";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { AddHouseModal } from "@/components/house/AddHouseModal";
import { Button } from '@/components/ui/button';
import { useDeleteHouse } from '@/hooks/houses/useDeleteHouse';
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

export default function HousesPage() {
  const { data: houses, isLoading, isError } = useGetHouses();
  const { mutate: deleteHouse } = useDeleteHouse();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Houses</h1>
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
    return <div>Error fetching houses</div>;
  }

  const handleDelete = (houseId: string) => {
    deleteHouse(houseId);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Houses</h1>
        <AddHouseModal />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {houses?.map((house: House) => (
          <div key={house.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow flex justify-between items-center">
            <Link href={`/dashboard/houses/${house.id}/rooms`} >
              <div>
                <h2 className="text-xl font-semibold">{house.name}</h2>
                <p className="text-gray-500">{house.address}</p>
              </div>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the house and all associated rooms, tenants, and payment history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(String(house.id))}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );
}
