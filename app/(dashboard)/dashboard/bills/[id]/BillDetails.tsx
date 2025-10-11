import React, { useState, useEffect } from "react";
import { useGetBillDetails } from "@/hooks/bills/useGetBillDetails";
import { useUpdateBillItem } from "@/hooks/bills/useUpdateBillItem";
import { PaymentHistory, PaymentStatus } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface EditableBillItem {
  type: 'electricity' | 'water' | 'rent' | 'waste';
  amount: string;
  paid: string;
  status: PaymentStatus;
}

export function BillDetails({ roomId }: { roomId: number }) {
  const { data: paymentHistory = [], isLoading, isError } = useGetBillDetails(roomId.toString());
  const { mutate: updateBillItem } = useUpdateBillItem(roomId.toString());

  const [editingItem, setEditingItem] = useState<{ paymentId: number; type: EditableBillItem['type'] } | null>(null);
  const [editedData, setEditedData] = useState<EditableBillItem | null>(null);

  const handleEdit = (paymentId: number, type: EditableBillItem['type'], currentData: EditableBillItem) => {
    setEditingItem({ paymentId, type });
    setEditedData(currentData);
  };

  const handleSave = async () => {
    if (editingItem && editedData) {
      try {
        await updateBillItem({
          paymentId: editingItem.paymentId,
          itemType: editingItem.type,
          itemData: {
            amount: editedData.amount,
            paid: editedData.paid,
            status: editedData.status,
          },
        });
        toast({
          title: "Bill Item Updated",
          description: "The bill item has been successfully updated.",
        });
        setEditingItem(null);
        setEditedData(null);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update bill item. Please try again.",
          variant: "destructive",
        });
        console.error("Failed to update bill item:", error);
      }
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditedData(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [e.target.name]: e.target.value,
      });
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  if (isError) {
    return <div>Error loading bill details.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Bill Details</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Billing Month</TableHead>
            <TableHead>Item Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paymentHistory.map((history) => (
            <React.Fragment key={history.id}>
              {['electricity', 'water', 'rent', 'waste'].map((type) => {
                const itemType = type as EditableBillItem['type'];
                const isEditing = editingItem?.paymentId === history.id && editingItem?.type === itemType;
                const currentAmount = history[itemType];
                const currentPaid = history[`${itemType}_paid` as keyof PaymentHistory];
                const currentStatus = history[`${itemType}_status` as keyof PaymentHistory];

                return (
                  <TableRow key={`${history.id}-${itemType}`}>
                    <TableCell>{history.billing_month}</TableCell>
                    <TableCell className="capitalize">{itemType}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="amount"
                          value={editedData?.amount || ''}
                          onChange={handleChange}
                        />
                      ) : (
                        `Rs. ${currentAmount}`
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="paid"
                          value={editedData?.paid || ''}
                          onChange={handleChange}
                        />
                      ) : (
                        `Rs. ${currentPaid}`
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="status"
                          value={editedData?.status || ''}
                          onChange={handleChange}
                        />
                      ) : (
                        currentStatus
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <>
                          <Button size="sm" onClick={handleSave} className="mr-2">Save</Button>
                          <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleEdit(history.id, itemType, {
                              type: itemType,
                              amount: currentAmount as string,
                              paid: currentPaid as string,
                              status: currentStatus as PaymentStatus,
                            })
                          }
                        >
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
