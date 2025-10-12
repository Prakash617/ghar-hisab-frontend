"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { useCreatePaymentHistory } from "@/hooks/bills/useCreatePaymentHistory";
import { PaymentHistoryPayload } from "@/lib/bills";
import { useGetBillDetails } from "@/hooks/bills/useGetBillDetails";
import { AddPaymentForm } from "@/components/bill/AddPaymentForm";

interface AddPaymentHistoryModalProps {
  roomId: string;
  onPaymentHistoryAdded: () => void;
}

export function AddPaymentHistoryModal({ roomId, onPaymentHistoryAdded }: AddPaymentHistoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: createPaymentHistory, isPending } = useCreatePaymentHistory();
  const { data: paymentHistory } = useGetBillDetails(roomId);

  const handleFormSubmit = async (payload: PaymentHistoryPayload) => {
    try {
      await createPaymentHistory({
        roomId: parseInt(roomId),
        billing_month: payload.billing_month,
        previous_units: payload.previous_units,
        current_units: payload.current_units,
        electricity: payload.electricity,
        water: payload.water,
        rent: payload.rent,
        waste: payload.waste,
      });
      toast({
        title: "Payment History added successfully!",
        description: "A new payment history entry has been recorded.",
      });
      setIsOpen(false);
      onPaymentHistoryAdded();
    } catch (error) {
      toast({
        title: "Failed to add payment history",
        description: "There was an error recording the payment history. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to add payment history:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add New Bill</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Payment Bill</DialogTitle>
          <DialogDescription>
            Record a new payment bill entry for the room.
          </DialogDescription>
        </DialogHeader>
        <AddPaymentForm 
          roomId={parseInt(roomId)} 
          onAddPayment={handleFormSubmit} 
          lastPayment={paymentHistory && paymentHistory.length > 0 ? paymentHistory[0] : undefined} 
        />
      </DialogContent>
    </Dialog>
  );
}
