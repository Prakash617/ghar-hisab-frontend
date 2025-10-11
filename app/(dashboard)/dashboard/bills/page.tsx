"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useGetPaymentHistories } from "@/hooks/bills/useGetPaymentHistories";
import { useGetAllRooms } from "@/hooks/rooms/useGetAllRooms";
import { useGetHouses } from "@/hooks/houses/useGetHouses";
import { useGetAllTenants } from "@/hooks/tenants/useGetAllTenants";
import { Atom } from "react-loading-indicators";

export default function Room() {
  const { data: paymentHistories, isLoading: loadingPayments } = useGetPaymentHistories();
  const { data: rooms, isLoading: loadingRooms } = useGetAllRooms();
  const { data: houses, isLoading: loadingHouses } = useGetHouses();
  const { data: tenants, isLoading: loadingTenants } = useGetAllTenants();

  const isLoading = loadingPayments || loadingRooms || loadingHouses || loadingTenants;

  const getHouseName = (roomId: number) => {
    const room = rooms?.find(r => r.id === roomId);
    const house = houses?.find(h => h.id === room?.house);
    return house?.name || "N/A";
  };

  const getRoomNumber = (roomId: number) => {
    const room = rooms?.find(r => r.id === roomId);
    return room?.room_number || "N/A";
  };

  const getTenantName = (roomId: number) => {
    const tenant = tenants?.find(t => t.roomId === roomId);
    return tenant?.name || "N/A";
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Atom color="#32cd32" size="medium" text="" textColor="" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{paymentHistories?.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Paid Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {paymentHistories?.filter((r) => r.status === "Paid").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unpaid Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {paymentHistories?.filter((r) => r.status !== "Paid").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rooms Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Due payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>House</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>Electricity</TableHead>
                <TableHead>Water</TableHead>
                <TableHead>Waste</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistories?.filter(history => history.status !== "Paid").map((history) => (
                <TableRow key={history.id}>
                  <TableCell>{getHouseName(history.roomId)}</TableCell>
                  <TableCell>{getRoomNumber(history.roomId)}</TableCell>
                  <TableCell>{getTenantName(history.roomId)}</TableCell>
                  <TableCell>Rs. {parseFloat(history.rent) - parseFloat(history.rent_paid)}</TableCell>
                  <TableCell>Rs. {parseFloat(history.electricity) - parseFloat(history.electricity_paid)}</TableCell>
                  <TableCell>Rs. {parseFloat(history.water) - parseFloat(history.water_paid)}</TableCell>
                  <TableCell>Rs. {parseFloat(history.waste) - parseFloat(history.waste_paid)}</TableCell>
                  <TableCell>
                    <Badge 
                      className={{
                        "Paid": "bg-green-500",
                        "Unpaid": "bg-red-500",
                        "Partially Paid": "bg-yellow-500",
                      }[history.status] || "bg-gray-400"}
                    >
                      {history.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/bills/${history.roomId}`}>
                      <Button size="sm" variant="outline">
                        View Detail
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
