"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PaymentHistory } from "@/lib/types";
import { PaymentHistoryPayload } from "@/lib/bills";
import { useGetTenantByRoomId } from "@/hooks/tenants/useGetTenantByRoomId";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface AddPaymentFormProps {
  onAddPayment: (payload: PaymentHistoryPayload) => void;
  lastPayment?: PaymentHistory;
  roomId: number;
}

export const AddPaymentForm = ({ onAddPayment, lastPayment, roomId }: AddPaymentFormProps) => {
  const { data: tenant } = useGetTenantByRoomId(roomId.toString());
  const { toast } = useToast();

  const [billing_month, setBillingMonth] = useState("");
  const [previous_units, setPreviousUnits] = useState(0);
  const [current_units, setCurrentUnits] = useState(0);
  const [electricity, setElectricity] = useState(0);
  const [water, setWater] = useState(0);
  const [rent, setRent] = useState(0);
  const [waste, setWaste] = useState(0);

  useEffect(() => {
    if (lastPayment) {
      setPreviousUnits(lastPayment.current_units);
    }
  }, [lastPayment]);

  useEffect(() => {
    if (tenant) {
      if (current_units > 0 && current_units < previous_units) {
        toast({
          title: "Invalid Units",
          description: "Current units cannot be less than previous units.",
          variant: "destructive",
        });
      }
      const unitsConsumed = current_units - previous_units;
      if (unitsConsumed > 0) {
        setElectricity(unitsConsumed * parseFloat(tenant.electricityPricePerUnit));
      } else {
        setElectricity(0);
      }
      setWater(parseFloat(tenant.water_price));
      setRent(parseFloat(tenant.rent_price));
      setWaste(parseFloat(tenant.waste_price));
    }
  }, [tenant, current_units, previous_units, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (current_units > 0 && current_units < previous_units) {
      toast({
        title: "Invalid Units",
        description: "Current units cannot be less than previous units.",
        variant: "destructive",
      });
      return;
    }
    onAddPayment({
      room: roomId,
      billing_month,
      previous_units,
      current_units,
      electricity,
      water,
      rent,
      waste,
    });
    // Reset form
    setBillingMonth("");
    setPreviousUnits(current_units);
    setCurrentUnits(0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1" htmlFor="billing_month">
            Billing Month
          </label>
          <Input
            id="billing_month"
            type="date"
            value={billing_month}
            onChange={(e) => setBillingMonth(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="previous_units">
            Previous Units
          </label>
          <Input
            id="previous_units"
            type="number"
            value={previous_units}
            onChange={(e) => setPreviousUnits(Number(e.target.value))}
            required
            disabled
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="current_units">
            Current Units
          </label>
          <Input
            id="current_units"
            type="number"
            value={current_units}
            onChange={(e) => setCurrentUnits(Number(e.target.value))}
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="block font-medium mb-1" htmlFor="electricity">
              Electricity
            </label>
            <Input
              id="electricity"
              type="number"
              value={electricity}
              onChange={(e) => setElectricity(Number(e.target.value))}
              required
              disabled
            />
          </div>
          {tenant && (
            <div className="text-sm text-gray-500 mt-7">
              @ {tenant.electricityPricePerUnit} / unit
            </div>
          )}
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="water">
            Water
          </label>
          <Input
            id="water"
            type="number"
            value={water}
            onChange={(e) => setWater(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="rent">
            Rent
          </label>
          <Input
            id="rent"
            type="number"
            value={rent}
            onChange={(e) => setRent(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="waste">
            Waste
          </label>
          <Input
            id="waste"
            type="number"
            value={waste}
            onChange={(e) => setWaste(Number(e.target.value))}
            required
          />
        </div>
      </div>
      <Button type="submit">Add New Bill</Button>
    </form>
  );
};
