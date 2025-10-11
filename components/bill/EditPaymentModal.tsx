import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentReceived } from "@/lib/payment-received";
import { useUpdatePaymentReceived } from "@/hooks/bills/useUpdatePaymentReceived";
import { toast } from "@/components/ui/use-toast";

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentReceived;
  onPaymentUpdated: () => void;
}

export const EditPaymentModal = ({ isOpen, onClose, payment, onPaymentUpdated }: EditPaymentModalProps) => {
  const [amount, setAmount] = useState(payment.amount.toString());
  const [receivedDate, setReceivedDate] = useState(payment.received_date);
  const [remarks, setRemarks] = useState(payment.remarks || "");

  const updatePaymentMutation = useUpdatePaymentReceived(payment.tenant_id);

  useEffect(() => {
    setAmount(payment.amount.toString());
    setReceivedDate(payment.received_date);
    setRemarks(payment.remarks || "");
  }, [payment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePaymentMutation.mutateAsync({
        paymentId: payment.id,
        payload: {
          amount: parseFloat(amount),
          received_date: receivedDate,
          remarks,
        },
      });
      toast({
        title: "Payment Updated",
        description: "Payment details have been successfully updated.",
      });
      onPaymentUpdated();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update payment:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="receivedDate" className="text-right">
              Received Date
            </Label>
            <Input
              id="receivedDate"
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="remarks" className="text-right">
              Remarks
            </Label>
            <Input
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={updatePaymentMutation.isPending}>
              {updatePaymentMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
