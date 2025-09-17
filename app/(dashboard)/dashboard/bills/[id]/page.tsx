"use client";

import { useState, useMemo, use } from "react";
import { TenantInfoCard } from "@/components/bill/TenantInfoCard";
import { Button } from "@/components/ui/button";
import { PaymentHistoryTable } from "@/components/bill/PaymentHistoryTable";
import { PaymentHistory, BillItem } from "@/lib/types";
import { useGetPaymentHistories } from "@/hooks/bills/useGetPaymentHistories";

// --- DUMMY DATA ---
const tenants: Record<string, { name: string; contact: string; moveInDate: string }> = {
  "101": { name: "John Doe", contact: "9812345678", moveInDate: "2025-01-15" },
  "102": { name: "Jane Smith", contact: "9876543210", moveInDate: "2025-02-01" },
};

const ELECTRICITY_RATE = 15;

// --- UTILITY to calculate overall status ---
const getOverallStatus = (bill: PaymentHistory): "Paid" | "Unpaid" | "Partial" => {
    const items: (keyof PaymentHistory)[] = ['electricity', 'water', 'rent'];
    const statuses = items.map(item => (bill[item] as BillItem).status);
    if (statuses.every(s => s === 'Paid')) return 'Paid';
    if (statuses.every(s => s === 'Unpaid')) return 'Unpaid';
    return 'Partial';
}

// --- MAIN PAGE COMPONENT ---
export default function BillsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: roomId } = use(params);
  const tenant = useMemo(() => tenants[roomId], [roomId]);

  const { data: paymentHistoryData, isLoading, isError } = useGetPaymentHistories();

  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>(paymentHistoryData || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<PaymentHistory | null>(null);

  const [showEditItemDialog, setShowEditItemDialog] = useState(false);
  const [itemToEditIndex, setItemToEditIndex] = useState<number | null>(null);
  const [itemToEditType, setItemToEditType] = useState<'electricity' | 'water' | 'rent' | null>(null);
  const [itemToEditData, setItemToEditData] = useState<BillItem | null>(null);

  useMemo(() => {
    if (paymentHistoryData) {
      setPaymentHistory(paymentHistoryData);
    }
  }, [paymentHistoryData]);

  const handleAddBill = () => {
    const lastBill = paymentHistory[0]; // Get the first bill for previous units
    const newBill: PaymentHistory = {
      id: Math.random(),
      month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      previousUnits: lastBill ? lastBill.currentUnits : 0,
      currentUnits: lastBill ? lastBill.currentUnits : 0,
      electricity: { amount: 0, status: "Unpaid" },
      water: { amount: lastBill ? lastBill.water.amount : 500, status: "Unpaid" },
      rent: { amount: lastBill ? lastBill.rent.amount : 10000, status: "Unpaid" },
      status: "Unpaid",
      total: 0,
      room: parseInt(roomId)
    };
    setPaymentHistory([newBill, ...paymentHistory]); // Add to top
    setEditingIndex(0); // Set editing index to 0 for the new top item
    setEditedData(newBill);
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

  const handleCloseEditItemDialog = () => {
    setShowEditItemDialog(false);
    setItemToEditIndex(null);
    setItemToEditType(null);
    setItemToEditData(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching data</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Room <span className="text-primary">{roomId}</span> Bill Details
      </h1>

      <TenantInfoCard tenant={tenant} />

      <div className="flex justify-end">
        <Button onClick={handleAddBill}>Add Bill</Button>
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
    </div>
  );
}
