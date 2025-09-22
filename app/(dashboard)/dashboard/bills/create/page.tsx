

"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useCreatePaymentHistory } from "@/hooks/bills/useCreatePaymentHistory";
import { useGetAllRooms } from "@/hooks/rooms/useGetAllRooms";
import { PaymentHistoryPayload } from "@/lib/bills";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreateBillPage() {
  const router = useRouter();
  const { data: rooms, isLoading: isLoadingRooms, isError: isErrorRooms } = useGetAllRooms();
  const { mutate: createPaymentHistory, isPending: isCreatingBill } = useCreatePaymentHistory();

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [previousUnits, setPreviousUnits] = useState(0);
  const [currentUnits, setCurrentUnits] = useState(0);
  const [unitsConsumed, setUnitsConsumed] = useState(0);
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const electricityRate = 13;

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    // In a real application, you might fetch the last reading for this room from the API
    // For now, we'll reset it.
    setPreviousUnits(0);
    setCurrentUnits(0);
    setUnitsConsumed(0);
    setCalculatedAmount(0);
  };

  const calculateElectricity = () => {
    if (currentUnits < previousUnits) {
      alert("Current reading cannot be less than previous reading");
      return;
    }
    const consumed = currentUnits - previousUnits;
    const amount = consumed * electricityRate;
    setUnitsConsumed(consumed);
    setCalculatedAmount(amount);
  };

  const saveBill = () => {
    if (!selectedRoomId) {
      alert("Please select a room first.");
      return;
    }
    if (currentUnits <= previousUnits) {
      alert("Current reading must be greater than previous reading to save a new bill.");
      return;
    }

    const billPayload: PaymentHistoryPayload = {
      room: parseInt(selectedRoomId),
      month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }), // Example month
      previousUnits,
      currentUnits,
      electricity: calculatedAmount,
      water: 0, // Assuming 0 for now, or add input fields for water
      rent: 0, // Assuming 0 for now, or fetch from room details
      total: calculatedAmount, // Assuming total is just electricity for now
      status: "Unpaid", // Default status
    };

    createPaymentHistory(billPayload, {
      onSuccess: () => {
        alert(`Bill for room ${selectedRoomId} has been created successfully!`);
        router.push(`/dashboard/bills/${selectedRoomId}`);
      },
      onError: (error) => {
        alert(`Failed to create bill: ${error.message}`);
      },
    });
  };

  if (isLoadingRooms) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Create a New Bill</h1>
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (isErrorRooms) {
    return <div>Error loading rooms.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create a New Bill</h1>
      
      <Card>
        <CardHeader>
            <CardTitle>Select a Room</CardTitle>
        </CardHeader>
        <CardContent>
            <Select onValueChange={handleRoomSelect}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select a room..." />
                </SelectTrigger>
                <SelectContent>
                    {rooms?.map(room => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                            Room {room.room_number}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </CardContent>
      </Card>

      {selectedRoomId && (
        <Card>
            <CardHeader>
                <CardTitle>Electricity Bill for Room {selectedRoomId}</CardTitle>
                <CardDescription>Calculate and save the monthly electricity bill.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="font-semibold">Previous Reading: <span className="font-mono p-1 bg-muted rounded">{previousUnits}</span> units</p>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        placeholder="Enter current meter reading"
                        value={currentUnits || ''}
                        onChange={(e) => setCurrentUnits(Number(e.target.value))}
                    />
                    <Button onClick={calculateElectricity}>Calculate</Button>
                </div>
                <div className="text-sm text-muted-foreground">
                    <p>Rate per unit: Rs. {electricityRate}</p>
                    <p>Units Consumed: {unitsConsumed} units</p>
                </div>
                <p className="text-lg font-bold">Total Electricity Bill: Rs. {calculatedAmount}</p>
                <div className="flex justify-end">
                    <Button onClick={saveBill} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isCreatingBill}>
                      {isCreatingBill ? "Saving..." : "Save Bill"}
                    </Button>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
