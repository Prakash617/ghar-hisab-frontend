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
import { BillItem } from "@/lib/types";
import { useUpdateBillItem } from "@/hooks/bills/useUpdateBillItem";

interface EditBillItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemData: BillItem | null;
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
  const [amount, setAmount] = useState(itemData?.amount || 0);
  const [status, setStatus] = useState(itemData?.status || "Unpaid");
  const { mutate: updateBillItem, isPending } = useUpdateBillItem(billId);

  useEffect(() => {
    if (itemData) {
      setAmount(itemData.amount);
      setStatus(itemData.status);
    }
  }, [itemData]);

  const handleSave = () => {
    console.log("handleSave called. paymentId:", paymentId, "itemType:", itemType);
    if (paymentId && itemType) {
      updateBillItem(
        {
          paymentId,
          itemType,
          updatedItem: { amount, status: status as "Paid" | "Unpaid" },
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
              onChange={(e) => setAmount(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="status" className="text-right">
              Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid</SelectItem>
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