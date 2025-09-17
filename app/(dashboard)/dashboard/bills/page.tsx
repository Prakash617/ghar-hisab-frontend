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

export default function Room() {
  const { data: paymentHistories, isLoading, isError } = useGetPaymentHistories();

  const electricityRate = 13; // Rs per unit

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching data</div>;
  }

  const rooms = paymentHistories?.map((history) => ({
    id: history.id,
    number: history.room.toString(),
    tenant: "N/A", // Tenant info is not in PaymentHistory type
    rent: history.rent.amount,
    electricityUnits: history.currentUnits - history.previousUnits,
    water: history.water.amount,
    status: history.status,
    month: history.month,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{rooms?.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Paid Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {rooms?.filter((r) => r.status === "Paid").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unpaid Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {rooms?.filter((r) => r.status !== "Paid").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rooms Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Monthly Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room No</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>House Rent</TableHead>
                <TableHead>Electricity Bill</TableHead>
                <TableHead>Water Bill</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms?.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>{room.number}</TableCell>
                  <TableCell>{room.tenant}</TableCell>
                  <TableCell>Rs. {room.rent}</TableCell>
                  <TableCell>
                    Rs. {room.electricityUnits * electricityRate}
                  </TableCell>
                  <TableCell>Rs. {room.water}</TableCell>
                  <TableCell>
                    {room.status === "Paid" && (
                      <Badge className="bg-green-500 text-white">Paid</Badge>
                    )}
                    {room.status !== "Paid" && (
                      <Badge className="bg-red-500 text-white">Not Paid</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/bills/${room.number}`}>
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
