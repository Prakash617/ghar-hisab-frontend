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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching data</div>;
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
          <CardTitle>Monthly Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room No</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>House Rent</TableHead>
                <TableHead>Electricity Bill</TableHead>
                <TableHead>Water Bill</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistories?.map((history) => (
                <TableRow key={history.id}>
                  <TableCell>{history.roomId}</TableCell>
                  <TableCell>{new Date(history.billing_month).toLocaleDateString()}</TableCell>
                  <TableCell>Rs. {history.rent}</TableCell>
                  <TableCell>Rs. {history.electricity}</TableCell>
                  <TableCell>Rs. {history.water}</TableCell>
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
