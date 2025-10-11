"use client";

import React, { useState } from 'react';
import { TenantInfoCard } from "@/components/bill/TenantInfoCard";
import { TenantDocumentsCard } from "@/components/bill/TenantDocumentsCard";
import { BillDetails } from "./BillDetails";
import { useGetTenantByRoomId } from "@/hooks/tenants/useGetTenantByRoomId";
import { Skeleton } from "@/components/ui/skeleton";
import { AddPaymentModal } from "@/components/bill/AddPaymentModal";
import { PaymentReceivedTable } from "@/components/bill/PaymentReceivedTable";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { BillSummaryCard } from "@/components/bill/BillSummaryCard";
import { useGetPaymentReceivedByTenantId } from "@/hooks/bills/useGetPaymentReceivedByTenantId";

export default function BillsDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id: roomId } = params;
  const { data: tenant, isLoading: isLoadingTenant, isError: isErrorTenant } = useGetTenantByRoomId(roomId);
  const queryClient = useQueryClient();

  const { data: payments, isLoading: isLoadingPayments, isError: isErrorPayments } = useGetPaymentReceivedByTenantId(tenant?.id?.toString() || "");

  const handlePaymentAdded = () => {
    if (tenant) {
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentReceived(tenant.id.toString()) });
    }
  };

  if (isLoadingTenant || isLoadingPayments) {
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

  if (isErrorTenant || !tenant) {
    console.error("Error fetching tenant details or tenant not found.", { isErrorTenant, tenant });
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

      <BillDetails roomId={parseInt(roomId)} />

      <div className="flex justify-end">
        <AddPaymentModal tenantId={tenant.id.toString()} onPaymentAdded={handlePaymentAdded} />
      </div>

      <PaymentReceivedTable key={tenant.id} tenantId={tenant.id.toString()} />
    </div>
  );
}
