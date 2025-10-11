"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentHistoryTable } from "@/components/bill/PaymentHistoryTable";
import { PaymentHistory, PaymentStatus } from "@/lib/types";
import { AddBillModal } from "@/components/bill/AddBillModal";
import { useGetBillDetails } from "@/hooks/bills/useGetBillDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdatePaymentHistory } from "@/hooks/bills/useUpdatePaymentHistory";
import { EditBillItemDialog } from "@/components/bill/EditBillItemDialog";

const ELECTRICITY_RATE = 50;

export function BillDetails({ roomId }: { roomId: number }) {
  const { data: paymentHistory = [], isLoading, isError } = useGetBillDetails(roomId.toString());
  const { mutate: updatePaymentHistory } = useUpdatePaymentHistory(roomId.toString());

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<PaymentHistory | null>(null);

  const [isAddBillModalOpen, setIsAddBillModalOpen] = useState(false);

  const [showEditItemDialog, setShowEditItemDialog] = useState(false);
  const [itemToEditData, setItemToEditData] = useState<{
    amount: string;
    paid: string;
    status: PaymentStatus;
  } | null>(null);
  const [itemToEditType, setItemToEditType] = useState<'electricity' | 'water' | 'rent' | 'waste' | null>(null);
  const [paymentIdToEdit, setPaymentIdToEdit] = useState<number | null>(null);

  const handleOpenAddBillModal = () => {
    setIsAddBillModalOpen(true);
  };

  const handleCloseAddBillModal = () => {
    setIsAddBillModalOpen(false);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditedData({ ...paymentHistory[index] });
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditedData(null);
  };

  const handleSave = () => {
    if (editedData && editingIndex !== null) {
      const dataToSend = { ...editedData, roomId: roomId };
      updatePaymentHistory(dataToSend);
      setEditingIndex(null);
      setEditedData(null);
    }
  };
  
  const handleFieldChange = (fieldName: keyof PaymentHistory, value: string | number) => {
    if (editedData) {
      const newData = { ...editedData, [fieldName]: value };

      if (fieldName === 'current_units') {
        const consumed = Number(value) - newData.previous_units;
        newData.electricity = (consumed * ELECTRICITY_RATE).toString();
      }

      setEditedData(newData);
    }
  };

  const handleEditBillItemClick = (paymentId: number, itemType: 'electricity' | 'water' | 'rent' | 'waste') => {
    const payment = paymentHistory.find(p => p.id === paymentId);
    if (payment) {
      setPaymentIdToEdit(paymentId);
      setItemToEditType(itemType);
      setItemToEditData({
        amount: payment[itemType],
        paid: payment[`${itemType}_paid`],
        status: payment[`${itemType}_status`]
      });
      setShowEditItemDialog(true);
    }
  };

  const handleCloseEditItemDialog = () => {
    setShowEditItemDialog(false);
    setPaymentIdToEdit(null);
    setItemToEditType(null);
    setItemToEditData(null);
  };

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }
  

  if (isError) {
    return <div>Error fetching bill details.</div>;
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={handleOpenAddBillModal}>Add Bill</Button>
      </div>

      <PaymentHistoryTable
        paymentHistory={paymentHistory}
        editingIndex={editingIndex}
        editedData={editedData}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onFieldChange={handleFieldChange}
        onEditItem={handleEditBillItemClick}
        billId={roomId.toString()}
      />

      <AddBillModal
        isOpen={isAddBillModalOpen}
        onClose={handleCloseAddBillModal}
        lastBill={paymentHistory[0] || null}
        roomId={roomId}
      />

      <EditBillItemDialog
        isOpen={showEditItemDialog}
        onClose={handleCloseEditItemDialog}
        itemData={itemToEditData}
        itemType={itemToEditType}
        billId={roomId.toString()}
        paymentId={paymentIdToEdit}
      />
    </>
  );
}