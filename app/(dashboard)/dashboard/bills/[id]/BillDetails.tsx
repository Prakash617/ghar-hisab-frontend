"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentHistoryTable } from "@/components/bill/PaymentHistoryTable";
import { PaymentHistory, BillItem } from "@/lib/types";
import { AddBillModal } from "@/components/bill/AddBillModal";
import { useGetBillDetails } from "@/hooks/bills/useGetBillDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdatePaymentHistory } from "@/hooks/bills/useUpdatePaymentHistory";
import { EditBillItemDialog } from "@/components/bill/EditBillItemDialog";
import { useUpdateBillItem } from "@/hooks/bills/useUpdateBillItem"; // New import

const ELECTRICITY_RATE = 15;

export function BillDetails({ roomId }: { roomId: number }) {
  const { data: paymentHistory = [], isLoading, isError } = useGetBillDetails(roomId.toString());
  const { mutate: updatePaymentHistory } = useUpdatePaymentHistory(roomId.toString());
  const { mutate: updateBillItem } = useUpdateBillItem(roomId.toString()); // Initialize new hook

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<PaymentHistory | null>(null);

  const [isAddBillModalOpen, setIsAddBillModalOpen] = useState(false);

  // New state for EditBillItemDialog
  const [showEditItemDialog, setShowEditItemDialog] = useState(false);
  const [itemToEditData, setItemToEditData] = useState<BillItem | null>(null);
  const [itemToEditType, setItemToEditType] = useState<'electricity' | 'water' | 'rent' | null>(null);
  const [paymentIdToEdit, setPaymentIdToEdit] = useState<number | null>(null);

  const handleOpenAddBillModal = () => {
    setIsAddBillModalOpen(true);
  };

  const handleCloseAddBillModal = () => {
    setIsAddBillModalOpen(false);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    console.log("Payment history item being edited:", paymentHistory[index]);
    console.log("Room ID of item being edited:", paymentHistory[index]?.roomId);
    setEditedData({ ...paymentHistory[index] });
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditedData(null);
  };

  const handleSave = () => {
    if (editedData && editingIndex !== null) {
      const dataToSend = { ...editedData, roomId: roomId };
      console.log("Edited data before update:", dataToSend);
      updatePaymentHistory(dataToSend);
      setEditingIndex(null);
      setEditedData(null);
    }
  };
  
  const handleFieldChange = (fieldName: keyof PaymentHistory, value: string | number) => {
    if (editedData) {
      let newData = { ...editedData };

      if (fieldName === 'currentUnits') {
        newData.currentUnits = value as number;
        const consumed = (value as number) - newData.previousUnits;
        newData.electricity = { ...newData.electricity, amount: consumed * ELECTRICITY_RATE };
      } else if (fieldName === 'electricity') {
        newData.electricity = { ...newData.electricity, amount: value as number };
      } else if (fieldName === 'water' || fieldName === 'rent') {
        newData[fieldName] = { ...newData[fieldName], amount: value as number };
      } else {
        newData = { ...newData, [fieldName]: value };
      }

      setEditedData(newData);
    }
  };

  // New function to handle individual item clicks
  const handleEditBillItemClick = (paymentId: number, itemType: 'electricity' | 'water' | 'rent', itemData: BillItem) => {
    setPaymentIdToEdit(paymentId);
    setItemToEditType(itemType);
    setItemToEditData(itemData);
    setShowEditItemDialog(true);
  };

  // New function to handle saving individual item edits
  const handleSaveBillItemEdit = (updatedItem: BillItem) => {
    if (paymentIdToEdit !== null && itemToEditType !== null) {
      updateBillItem({
        paymentId: paymentIdToEdit,
        itemType: itemToEditType,
        updatedItem: updatedItem,
      });
      // Close the dialog
      setShowEditItemDialog(false);
      setPaymentIdToEdit(null);
      setItemToEditType(null);
      setItemToEditData(null);
    }
  };

  const handleCloseEditItemDialog = () => {
    setShowEditItemDialog(false);
    setPaymentIdToEdit(null);
    setItemToEditType(null);
    setItemToEditData(null);
  };

  const handleSaveItemEdit = (index: number, itemType: 'electricity' | 'water' | 'rent', updatedItem: BillItem) => {
    // This part needs to be connected to a mutation to update the item on the server
    console.log("Saving item edit...", index, itemType, updatedItem);
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
        onEditItem={handleEditBillItemClick} // New prop
        billId={roomId.toString()}
      />

      <AddBillModal
        isOpen={isAddBillModalOpen}
        onClose={handleCloseAddBillModal}
        lastBill={paymentHistory[0] || null}
        roomId={roomId}
      />

      {/* Edit Bill Item Dialog */}
      <EditBillItemDialog
        isOpen={showEditItemDialog}
        onClose={handleCloseEditItemDialog}
        itemData={itemToEditData}
        onSave={handleSaveBillItemEdit}
        itemType={itemToEditType || ""}
      />
    </>
  );
}