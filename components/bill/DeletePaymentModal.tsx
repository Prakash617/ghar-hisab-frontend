import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PaymentReceived } from "@/lib/payment-received";
import { useDeletePaymentHistory } from "@/hooks/bills/useDeletePaymentHistory";
import { toast } from "@/components/ui/use-toast";

interface DeletePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentReceived;
  onPaymentDeleted: () => void;
}

export const DeletePaymentModal = ({ isOpen, onClose, payment, onPaymentDeleted }: DeletePaymentModalProps) => {
  const deletePaymentMutation = useDeletePaymentHistory();

  const handleDelete = async () => {
    try {
      await deletePaymentMutation.mutateAsync(payment.id);
      toast({
        title: "Payment Deleted",
        description: "Payment record has been successfully deleted.",
      });
      onPaymentDeleted();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete payment. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to delete payment:", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the payment record for amount
            <span className="font-bold"> Rs. {Number(payment.amount).toFixed(2)}</span> received on
            <span className="font-bold"> {new Date(payment.received_date).toLocaleDateString()}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deletePaymentMutation.isPending}>
            {deletePaymentMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
