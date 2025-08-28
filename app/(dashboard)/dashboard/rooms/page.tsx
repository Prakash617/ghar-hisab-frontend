"use client"


import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
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
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"


interface Room {
    id: number;
    roomNumber: string;
    status: "Occupied" | "Vacant" | "Maintenance";
    tenant: string;
    rent: string;
  }

const initialRooms: Room[] = [
  {
    id: 1,
    roomNumber: "101",
    status: "Occupied",
    tenant: "John Doe",
    rent: "Rs. 10,000",
  },
  {
    id: 2,
    roomNumber: "102",
    status: "Vacant",
    tenant: "-",
    rent: "Rs. 9,000",
  },
  {
    id: 3,
    roomNumber: "201",
    status: "Occupied",
    tenant: "Jane Smith",
    rent: "Rs. 12,000",
  },
  {
    id: 4,
    roomNumber: "202",
    status: "Maintenance",
    tenant: "-",
    rent: "Rs. 11,000",
  },
]

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [open, setOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [newRoomStatus, setNewRoomStatus] = useState<"Occupied" | "Vacant" | "Maintenance">("Vacant")

  const [editingRoomStatus, setEditingRoomStatus] = useState<"Occupied" | "Vacant" | "Maintenance" | null>(null)

  const handleAddRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
        roomNumber: { value: string };
        tenant: { value: string };
        rent: { value: string };
    };
    const newRoom: Room = {
      id: rooms.length + 1,
      roomNumber: target.roomNumber.value,
      status: newRoomStatus,
      tenant: target.tenant.value || "-",
      rent: target.rent.value,
    }
    setRooms([...rooms, newRoom])
    setOpen(false)
  }

  const handleEditRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
        roomNumber: { value: string };
        tenant: { value: string };
        rent: { value: string };
    };
    const updatedRooms = rooms.map((room) =>
      room.id === selectedRoom?.id
        ? {
            ...room,
            roomNumber: target.roomNumber.value,
            status: editingRoomStatus || room.status,
            tenant: target.tenant.value,
            rent: target.rent.value,
          }
        : room
    )
    setRooms(updatedRooms)
    setSelectedRoom(null)
    setEditingRoomStatus(null)
    setIsEditDialogOpen(false)
  }

  const handleDeleteRoom = (id: number) => {
    setRooms(rooms.filter((room) => room.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Room</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRoom}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="roomNumber" className="text-right">
                    Room No.
                  </Label>
                  <Input id="roomNumber" name="roomNumber" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                        Status
                    </Label>
                    <Select onValueChange={(value: "Occupied" | "Vacant" | "Maintenance") => setNewRoomStatus(value)} defaultValue={newRoomStatus}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Occupied">Occupied</SelectItem>
                            <SelectItem value="Vacant">Vacant</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tenant" className="text-right">
                    Tenant
                  </Label>
                  <Input id="tenant" name="tenant" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rent" className="text-right">
                    Rent
                  </Label>
                  <Input id="rent" name="rent" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add Room</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room No.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>{room.roomNumber}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        room.status === "Occupied"
                          ? "bg-green-100 text-green-700"
                          : room.status === "Vacant"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {room.status}
                    </span>
                  </TableCell>
                  <TableCell>{room.tenant}</TableCell>
                  <TableCell>{room.rent}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Room Details</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <p><strong>Room No.:</strong> {room.roomNumber}</p>
                          <p><strong>Status:</strong> {room.status}</p>
                          <p><strong>Tenant:</strong> {room.tenant}</p>
                          <p><strong>Rent:</strong> {room.rent}</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                        setSelectedRoom(room)
                        setEditingRoomStatus(room.status)
                        setIsEditDialogOpen(true)
                        }}
                    >
                        Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you sure you want to delete this room?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            room and its data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteRoom(room.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isEditDialogOpen} onOpenChange={() => {setIsEditDialogOpen(false); setSelectedRoom(null); setEditingRoomStatus(null);}}>
        {selectedRoom && (
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Edit Room</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditRoom}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="roomNumber" className="text-right">
                        Room No.
                    </Label>
                    <Input
                        id="roomNumber"
                        name="roomNumber"
                        defaultValue={selectedRoom.roomNumber}
                        className="col-span-3"
                    />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Status
                        </Label>
                        <Select onValueChange={(value: "Occupied" | "Vacant" | "Maintenance") => setEditingRoomStatus(value)} defaultValue={selectedRoom.status}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Occupied">Occupied</SelectItem>
                                <SelectItem value="Vacant">Vacant</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tenant" className="text-right">
                        Tenant
                    </Label>
                    <Input
                        id="tenant"
                        name="tenant"
                        defaultValue={selectedRoom.tenant}
                        className="col-span-3"
                    />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rent" className="text-right">
                        Rent
                    </Label>
                    <Input
                        id="rent"
                        name="rent"
                        defaultValue={selectedRoom.rent}
                        className="col-span-3"
                    />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Save Changes</Button>
                </DialogFooter>
                </form>
            </DialogContent>
        )}
        </Dialog>
    </div>
  )
}
