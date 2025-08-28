"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Room() {
  const rooms = [
    { number: "101", tenant: "John Doe", rent: 10000, electricityUnits: 50, water: 500, status: "Paid" },
    { number: "102", tenant: "Jane Smith", rent: 9000, electricityUnits: 30, water: 500, status: "Not Paid" },
    { number: "103", tenant: "-", rent: 8000, electricityUnits: 0, water: 500, status: "Vacant" },
  ]

  const electricityRate = 13 // Rs per unit

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Rooms</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{rooms.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Occupied Rooms</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{rooms.filter(r => r.tenant !== "-").length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Vacant Rooms</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{rooms.filter(r => r.tenant === "-").length}</p></CardContent>
        </Card>
      </div>

      {/* Rooms Table */}
      <Card>

        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Monthly Payment History</CardTitle>
          <Link href="/dashboard/bills/create">
            <Button>Create Bill</Button>
          </Link>
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
              {rooms.map(room => (
                <TableRow key={room.number}>
                  <TableCell>{room.number}</TableCell>
                  <TableCell>{room.tenant}</TableCell>
                  <TableCell>Rs. {room.rent}</TableCell>
                  <TableCell>Rs. {room.electricityUnits * electricityRate}</TableCell>
                  <TableCell>Rs. {room.water}</TableCell>
                  <TableCell>
                    {room.status === "Paid" && <Badge className="bg-green-500 text-white">Paid</Badge>}
                    {room.status === "Not Paid" && <Badge className="bg-red-500 text-white">Not Paid</Badge>}
                    {room.status === "Vacant" && <Badge className="bg-gray-400 text-white">Vacant</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/bills/${room.number}`}>
                      <Button size="sm" variant="outline">Edit</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
