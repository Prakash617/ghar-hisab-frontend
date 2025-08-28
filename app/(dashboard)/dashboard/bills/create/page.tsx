

"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

// --- DUMMY DATA (similar to [id]/page.tsx) ---
const tenants: Record<string, { name: string; contact: string; moveInDate: string }> = {
  "101": { name: "John Doe", contact: "9812345678", moveInDate: "2025-01-15" },
  "102": { name: "Jane Smith", contact: "9876543210", moveInDate: "2025-02-01" },
};

const initialPaymentHistory: Record<string, any[]> = {
    "101": [
        { month: "January 2025", previousUnits: 1100, currentUnits: 1200, electricity: 1300, water: 500, rent: 10000, status: "Paid" },
        { month: "February 2025", previousUnits: 1200, currentUnits: 1300, electricity: 1200, water: 500, rent: 10000, status: "Paid" },
        { month: "March 2025", previousUnits: 1300, currentUnits: 1400, electricity: 1100, water: 500, rent: 10000, status: "Unpaid" },
    ],
    "102": [],
};


export default function CreateBillPage() {
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [previousUnits, setPreviousUnits] = useState(0);
  const [currentUnits, setCurrentUnits] = useState(0);
  const [unitsConsumed, setUnitsConsumed] = useState(0);
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const electricityRate = 13;

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
    const history = initialPaymentHistory[roomId] || [];
    const lastReading = history.length > 0 ? history[history.length - 1].currentUnits : 0;
    setPreviousUnits(lastReading);
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
    if (!selectedRoom) {
        alert("Please select a room first.");
        return;
    }
    if (currentUnits <= previousUnits) {
        alert("Current reading must be greater than previous reading to save a new bill.");
        return;
    }
    
    // Here you would typically update your backend or state management
    console.log("Saving bill for room:", selectedRoom, {
        previousUnits,
        currentUnits,
        electricity: calculatedAmount,
        // ... other bill details
    });

    alert(`Bill for room ${selectedRoom} has been created successfully!`);
    router.push(`/dashboard/bills/${selectedRoom}`);
  };

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
                    {Object.keys(tenants).map(roomId => (
                        <SelectItem key={roomId} value={roomId}>
                            Room {roomId} ({tenants[roomId].name})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </CardContent>
      </Card>

      {selectedRoom && (
        <Card>
            <CardHeader>
                <CardTitle>Electricity Bill for Room {selectedRoom}</CardTitle>
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
                    <Button onClick={saveBill} className="bg-blue-600 hover:bg-blue-700 text-white">Save Bill</Button>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
