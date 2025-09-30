
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentHistory } from "@/lib/types";

import { PaymentHistoryPayload } from "@/lib/bills"; // Import PaymentHistoryPayload

interface AddPaymentFormProps {
  onAddPayment: (payload: PaymentHistoryPayload) => void;
  lastPayment?: PaymentHistory;
  roomId: number; // Added roomId
}

const ELECTRICITY_RATE = 12;

export const AddPaymentForm = ({ onAddPayment, lastPayment, roomId }: AddPaymentFormProps) => {
  const [month, setMonth] = useState("");
  const [previousUnits, setPreviousUnits] = useState(0);
  const [currentUnits, setCurrentUnits] = useState(0);
  const [water, setWater] = useState(500);
  const [rent, setRent] = useState(10000);
  const [waste, setWaste] = useState(100);
  const [status, setStatus] = useState<"Paid" | "Unpaid" | "Partial">("Unpaid");
  const [electricityCost, setElectricityCost] = useState(0);

  useEffect(() => {
    if (lastPayment) {
      setPreviousUnits(lastPayment.currentUnits);
    }
  }, [lastPayment]);

  useEffect(() => {
    const unitsConsumed = currentUnits - previousUnits;
    if (unitsConsumed > 0) {
      setElectricityCost(unitsConsumed * ELECTRICITY_RATE);
    } else {
      setElectricityCost(0);
    }
  }, [currentUnits, previousUnits]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = electricityCost + water + rent + waste; // Calculate total
    onAddPayment({
      room: roomId, // Use the new roomId prop
      month,
      previousUnits,
      currentUnits,
      electricity: electricityCost, // Pass electricityCost as electricity
      water,
      rent,
      waste,
      total, // Pass the calculated total
      status,
    });
    // Reset form
    setMonth("");
    setPreviousUnits(currentUnits);
    setCurrentUnits(0);
    setStatus("Unpaid");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">Add New Payment</h3>
      <p className="text-sm text-muted-foreground">
        Enter the details for the new payment. Electricity rate is Rs. {ELECTRICITY_RATE} per unit.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1" htmlFor="month">
            Month
          </label>
          <input
            id="month"
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="previousUnits">
            Previous Units
          </label>
          <input
            id="previousUnits"
            type="number"
            value={previousUnits}
            onChange={(e) => setPreviousUnits(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            required
            disabled // This field is now auto-filled
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="currentUnits">
            Current Units
          </label>
          <input
            id="currentUnits"
            type="number"
            value={currentUnits}
            onChange={(e) => setCurrentUnits(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="water">
            Water
          </label>
          <input
            id="water"
            type="number"
            value={water}
            onChange={(e) => setWater(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="rent">
            Rent
          </label>
          <input
            id="rent"
            type="number"
            value={rent}
            onChange={(e) => setRent(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="waste">
            Waste
          </label>
          <input
            id="waste"
            type="number"
            value={waste}
            onChange={(e) => setWaste(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="status">
            Status
          </label>
          <Select value={status} onValueChange={(value: "Paid" | "Unpaid" | "Partial") => setStatus(value)}>
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
              <SelectItem value="Partial">Partial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4">
        <p className="font-semibold">Calculated Electricity Cost: <span className="text-primary">Rs. {electricityCost.toFixed(2)}</span></p>
      </div>
      <Button type="submit">Add Payment</Button>
    </form>
  );
};
