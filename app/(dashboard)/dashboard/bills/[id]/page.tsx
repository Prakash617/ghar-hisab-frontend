"use client";

import React, { useState } from 'react';
import { TenantInfoCard } from "@/components/bill/TenantInfoCard";
import { TenantDocumentsCard } from "@/components/bill/TenantDocumentsCard";
import { useGetTenantByRoomId } from "@/hooks/tenants/useGetTenantByRoomId";
import { Skeleton } from "@/components/ui/skeleton";
import { AddPaymentReceivedModal } from "@/components/bill/AddPaymentReceivedModal";
import { PaymentReceivedTable } from "@/components/bill/PaymentReceivedTable";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { BillSummaryCard } from "@/components/bill/BillSummaryCard";
import { useGetPaymentReceivedByTenantId } from "@/hooks/bills/useGetPaymentReceivedByTenantId";
import { PaymentHistoryTable } from "@/components/bill/PaymentHistoryTable";
import { useGetBillDetails } from "@/hooks/bills/useGetBillDetails";
import { PaymentHistory, PaymentStatus } from "@/lib/types";
import { useUpdateBillItem } from "@/hooks/bills/useUpdateBillItem";
import { toast } from "@/components/ui/use-toast";
import { AddPaymentHistoryModal } from "@/components/bill/AddPaymentHistoryModal";
import { EditBillItemDialog } from "@/components/bill/EditBillItemDialog";
import { BillDetails } from './BillDetails';

export default function BillsDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id: roomId } = params;
  const { data: tenant, isLoading: isLoadingTenant, isError: isErrorTenant } = useGetTenantByRoomId(roomId);
  const { data: paymentHistory = [], isLoading: isLoadingPaymentHistory, isError: isErrorPaymentHistory } = useGetBillDetails(roomId.toString());
  const queryClient = useQueryClient();

  const { data: payments, isLoading: isLoadingPayments, isError: isErrorPayments } = useGetPaymentReceivedByTenantId(tenant?.id?.toString() || "");

  const { mutate: updateBillItem } = useUpdateBillItem(roomId.toString());

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<PaymentHistory | null>(null);

  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [editItemDialogData, setEditItemDialogData] = useState<{ amount: string; paid: string; status: PaymentStatus } | null>(null);
  const [editItemDialogType, setEditItemDialogType] = useState<'electricity' | 'water' | 'rent' | 'waste' | null>(null);
  const [editItemDialogPaymentId, setEditItemDialogPaymentId] = useState<number | null>(null);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditedData(paymentHistory[index]);
  };

  const handleSave = async () => {
    if (editedData && editingIndex !== null) {
      try {
        // Assuming editedData contains the full PaymentHistory object with updated values
        // This part needs to be refined based on how individual fields are updated in PaymentHistoryTable
        // For now, we'll assume editedData is the complete updated object.
        // The useUpdateBillItem hook expects itemType and itemData, so we need to adapt.
        // This is a placeholder and needs to be adjusted based on the actual editing flow.
        // For simplicity, let's assume we are updating the entire payment history entry for now.
        // This will require a new hook or modification to useUpdateBillItem to handle full PaymentHistory updates.

        // Since PaymentHistoryTable is designed to edit individual items (electricity, water, etc.),
        // the handleSave here needs to know which item was edited.
        // This current setup is not ideal for the PaymentHistoryTable's design.
        // I will need to adjust PaymentHistoryTable's onSave/onFieldChange to pass more specific data.

        // For now, to make the build pass, I will create a dummy update that doesn't use useUpdateBillItem
        // and will address the proper integration in a subsequent step.

        // This is a temporary placeholder to make the build pass.
        // In a real scenario, you'd have a specific update function for PaymentHistory.
        console.log("Saving edited data:", editedData);
        toast({
          title: "Bill Item Updated (Placeholder)",
          description: "The bill item has been successfully updated (placeholder logic).",
        });
        setEditingIndex(null);
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
    setEditingIndex(null);
    setEditedData(null);
  };

  const handleFieldChange = (fieldName: keyof PaymentHistory, value: string | number) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [fieldName]: value,
      });
    }
  };

  const handleEditItem = async (paymentId: number, itemType: 'electricity' | 'water' | 'rent' | 'waste', itemData: { amount: string; paid: string; status: PaymentStatus }) => {
    setEditItemDialogPaymentId(paymentId);
    setEditItemDialogType(itemType);
    setEditItemDialogData(itemData);
    setIsEditItemDialogOpen(true);
  };

  const handlePaymentAdded = () => {
    if (tenant) {
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentReceived(tenant.id.toString()) });
    }
  };

  const handlePaymentHistoryAdded = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.billDetails(roomId) });
  };

  const handleEditItemDialogClose = () => {
    setIsEditItemDialogOpen(false);
    setEditItemDialogData(null);
    setEditItemDialogType(null);
    setEditItemDialogPaymentId(null);
    queryClient.invalidateQueries({ queryKey: queryKeys.billDetails(roomId) });
  };

  if (isLoadingTenant || isLoadingPayments || isLoadingPaymentHistory) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">
          Room <span className="text-primary">{roomId}</span> Bill Details
        </h1>
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (isErrorTenant || !tenant || isErrorPaymentHistory) {
    console.error("Error fetching tenant details or tenant not found.", { isErrorTenant, tenant, isErrorPaymentHistory });
    return <div>Error fetching tenant details or tenant not found.</div>;
  }

  if (isErrorPayments || !payments) {
    console.error("Error fetching payments or payments not found.", { isErrorPayments, payments });
    return <div>Error fetching payments or payments not found.</div>;
  }

  console.log("Tenant data for PaymentReceivedTable:", tenant);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Room <span className="text-primary">{roomId}</span> Bill Details
      </h1>

      <BillSummaryCard payments={payments} />

      <TenantInfoCard tenant={tenant} roomId={roomId} />
      <TenantDocumentsCard tenant={tenant} roomId={roomId} />

      {/* <div className="flex items-center justify-between"> */}
        {/* <h2 className="text-xl font-bold">Payment History</h2> */}
        {/* <AddPaymentHistoryModal roomId={roomId} onPaymentHistoryAdded={handlePaymentHistoryAdded} /> */}
      {/* </div> */}
      {/* <PaymentHistoryTable
        paymentHistory={paymentHistory}
        billId={roomId}
        editingIndex={editingIndex}
        editedData={editedData}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onFieldChange={handleFieldChange}
        onEditItem={handleEditItem}
      /> */}
      <BillDetails roomId={parseInt(roomId)} />


      <div className="flex items-center justify-between mt-2">
        <h2 className="text-xl font-bold">Payment Received History</h2>
        <AddPaymentReceivedModal tenantId={tenant.id.toString()} onPaymentAdded={handlePaymentAdded} />
      </div>
      <PaymentReceivedTable key={tenant.id} tenantId={tenant.id.toString()} />
{/* 
      <EditBillItemDialog
        isOpen={isEditItemDialogOpen}
        onClose={handleEditItemDialogClose}
        itemData={editItemDialogData}
        itemType={editItemDialogType}
        billId={roomId}
        paymentId={editItemDialogPaymentId}
      /> */}
    </div>
  );
}
