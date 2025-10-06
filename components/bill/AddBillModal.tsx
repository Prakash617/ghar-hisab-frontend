"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddPaymentForm } from "@/components/bill/AddPaymentForm"

import { PaymentHistory } from "@/lib/types"
import { useCreatePaymentHistory } from "@/hooks/bills/useCreatePaymentHistory"; // Import the hook
import { PaymentHistoryPayload } from "@/lib/bills"; // Import the payload type
import { Button } from "@/components/ui/button";

interface AddBillModalProps {
  isOpen: boolean
  onClose: () => void
  lastBill: PaymentHistory | null
  roomId: number
}

export function AddBillModal({ isOpen, onClose, lastBill, roomId }: AddBillModalProps) {
  const createPaymentMutation = useCreatePaymentHistory(); // Initialize the mutation

  const handleAddPayment = (paymentData: PaymentHistoryPayload) => {
    createPaymentMutation.mutate(paymentData, {
      onSuccess: () => {
        console.log("Payment added successfully!");
        onClose(); // Close the modal on success
      },
      onError: (error) => {
        console.error("Error adding payment:", error);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <AddPaymentForm onAddPayment={handleAddPayment} lastPayment={lastBill ?? undefined} roomId={roomId} />
      </DialogContent>
    </Dialog>
  )
}

export function AddBillModalTrigger() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DialogTrigger asChild>
      <Button onClick={() => setIsOpen(true)}>Add Bill</Button>
    </DialogTrigger>
  )
}
