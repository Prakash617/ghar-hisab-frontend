
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentHistoryTable } from "@/components/bill/PaymentHistoryTable";
import { PaymentHistory, BillItem } from "@/lib/types";
import { AddBillModal } from "@/components/bill/AddBillModal";

const ELECTRICITY_RATE = 15;

const getOverallStatus = (bill: PaymentHistory): "Paid" | "Unpaid" | "Partial" => {
    const items: (keyof PaymentHistory)[] = ['electricity', 'water', 'rent'];
    const statuses = items.map(item => (bill[item] as BillItem).status);
    if (statuses.every(s => s === 'Paid')) return 'Paid';
    if (statuses.every(s => s === 'Unpaid')) return 'Unpaid';
    return 'Partial';
}

export function BillDetails({ initialPaymentHistory, roomId }: { initialPaymentHistory: PaymentHistory[], roomId: number }) {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>(initialPaymentHistory);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<PaymentHistory | null>(null);

  const [showEditItemDialog, setShowEditItemDialog] = useState(false);
  const [itemToEditIndex, setItemToEditIndex] = useState<number | null>(null);
  const [itemToEditType, setItemToEditType] = useState<'electricity' | 'water' | 'rent' | null>(null);
  const [itemToEditData, setItemToEditData] = useState<BillItem | null>(null);

  const [isAddBillModalOpen, setIsAddBillModalOpen] = useState(false);

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
      const updatedHistory = [...paymentHistory];
      const finalData = { ...editedData, status: getOverallStatus(editedData) };
      updatedHistory[editingIndex] = finalData;
      setPaymentHistory(updatedHistory);
      setEditingIndex(null);
      setEditedData(null);
    }
  };

  const handleFieldChange = (fieldName: keyof PaymentHistory, value: any) => {
    if (editedData) {
      let newData = { ...editedData };

      if (fieldName === 'currentUnits') {
        newData.currentUnits = value;
        const consumed = value - newData.previousUnits;
        newData.electricity = { ...newData.electricity, amount: consumed * ELECTRICITY_RATE };
      } else if (fieldName === 'electricity') { // Added this condition
        newData.electricity = { ...newData.electricity, amount: value };
      } else if (fieldName === 'water' || fieldName === 'rent') {
        newData[fieldName] = { ...newData[fieldName], amount: value };
      } else {
        newData = { ...newData, [fieldName]: value };
      }

      setEditedData(newData);
    }
  };

  const handleDelete = (index: number) => {
    const updatedHistory = paymentHistory.filter((_, i) => i !== index);
    setPaymentHistory(updatedHistory);
    if (editingIndex === index) {
        setEditingIndex(null);
        setEditedData(null);
    } else if (editingIndex !== null && index < editingIndex) { // Adjust editingIndex if item above is deleted
        setEditingIndex(editingIndex - 1);
    }
  };

  const handleEditItem = (index: number, itemType: 'electricity' | 'water' | 'rent', itemData: BillItem) => {
    setItemToEditIndex(index);
    setItemToEditType(itemType);
    setItemToEditData(itemData);
    setShowEditItemDialog(true);
  };

  const handleSaveItemEdit = (index: number, itemType: 'electricity' | 'water' | 'rent', updatedItem: BillItem) => {
    const updatedHistory = paymentHistory.map((bill, idx) => {
      if (idx === index) {
        const newBill = { ...bill };
        newBill[itemType] = updatedItem;
        newBill.status = getOverallStatus(newBill);
        return newBill;
      }
      return bill;
    });
    setPaymentHistory(updatedHistory);
    setShowEditItemDialog(false);
    setItemToEditIndex(null);
    setItemToEditType(null);
    setItemToEditData(null);
  };

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
        onDelete={handleDelete}
        onEditItem={handleEditItem}
        onSaveItemEdit={handleSaveItemEdit}
      />

      <AddBillModal
        isOpen={isAddBillModalOpen}
        onClose={handleCloseAddBillModal}
        lastBill={paymentHistory[0] || null}
        roomId={roomId}
      />
    </>
  );
}
