"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BillForm } from "@/components/bill/BillForm"
import { AddPaymentForm } from "@/components/bill/AddPaymentForm"

import { PaymentHistory } from "@/lib/types"

interface AddBillModalProps {
  isOpen: boolean
  onClose: () => void
  lastBill: PaymentHistory | null
  roomId: number
}

export function AddBillModal({ isOpen, onClose, lastBill, roomId }: AddBillModalProps) {
  const handleAddPayment = (paymentData: any) => {
    console.log("Payment added:", paymentData);
    // Here you would typically handle the submission of payment data
    // e.g., call an API, update state, etc.
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <BillForm lastBill={lastBill} roomId={roomId} />
        <AddPaymentForm onAddPayment={handleAddPayment} lastPayment={lastBill} />
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
