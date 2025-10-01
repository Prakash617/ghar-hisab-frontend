"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentStatus } from "@/lib/types";
import { useUpdateBillItem } from "@/hooks/bills/useUpdateBillItem";

interface EditBillItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemData: {
    amount: string;
    paid: string;
    status: PaymentStatus;
  } | null;
  itemType: 'electricity' | 'water' | 'rent' | 'waste' | null;
  billId: string;
  paymentId: number | null;
}

export function EditBillItemDialog({
  isOpen,
  onClose,
  itemData,
  itemType,
  billId,
  paymentId,
}: EditBillItemDialogProps) {
  const [amount, setAmount] = useState("");
  const [paid, setPaid] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("Unpaid");
  const { mutate: updateBillItem, isPending } = useUpdateBillItem(billId);

  useEffect(() => {
    if (itemData) {
      setAmount(itemData.amount);
      setPaid(itemData.paid);
      setStatus(itemData.status);
    }
  }, [itemData]);

  const handleSave = () => {
    if (paymentId && itemType) {
      updateBillItem(
        {
          paymentId,
          itemType,
          itemData: { amount, paid, status },
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {itemType} Bill</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="amount" className="text-right">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="paid" className="text-right">
              Paid Amount
            </label>
            <Input
              id="paid"
              type="number"
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="status" className="text-right">
              Status
            </label>
            <Select value={status} onValueChange={(value) => setStatus(value as PaymentStatus)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}