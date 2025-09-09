
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
import { PaymentHistory } from "@/lib/types";

interface AddPaymentFormProps {
  onAddPayment: (payment: Omit<PaymentHistory, "bills" | "electricity">) => void;
  lastPayment?: PaymentHistory;
}

const ELECTRICITY_RATE = 12;

const generateMonthOptions = () => {
  const options: string[] = [];
  const date = new Date();
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  for (let i = 0; i < 12; i++) {
    options.push(`${monthNames[(currentMonth + i) % 12]} ${currentYear + Math.floor((currentMonth + i) / 12)}`);
  }
  return options;
};

export const AddPaymentForm = ({ onAddPayment, lastPayment }: AddPaymentFormProps) => {
  const monthOptions = generateMonthOptions();
  const [month, setMonth] = useState(monthOptions[0]);
  const [previousUnits, setPreviousUnits] = useState(0);
  const [currentUnits, setCurrentUnits] = useState(0);
  const [water, setWater] = useState(500);
  const [rent, setRent] = useState(10000);
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
    onAddPayment({
      month,
      previousUnits,
      currentUnits,
      water,
      rent,
    });
    // Reset form
    setMonth(monthOptions[0]);
    setPreviousUnits(currentUnits);
    setCurrentUnits(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Payment</CardTitle>
        <CardDescription>
          Enter the details for the new payment. Electricity rate is Rs. {ELECTRICITY_RATE} per unit.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1" htmlFor="month">
                Month
              </label>
              <select
                id="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              >
                {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
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
          </div>
          <div className="mt-4">
            <p className="font-semibold">Calculated Electricity Cost: <span className="text-primary">Rs. {electricityCost.toFixed(2)}</span></p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Add Payment</Button>
        </CardFooter>
      </form>
    </Card>
  );
};
