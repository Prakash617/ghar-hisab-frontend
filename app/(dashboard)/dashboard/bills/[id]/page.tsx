"use client";

import React from 'react';
import { TenantInfoCard } from "@/components/bill/TenantInfoCard";
import { BillDetails } from "./BillDetails";
import { useGetBillDetails } from "@/hooks/bills/useGetBillDetails";
import { useGetTenantByRoomId } from "@/hooks/tenants/useGetTenantByRoomId";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillsDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id: roomId } = React.use(params);
  const { data: paymentHistory, isLoading: isLoadingBills, isError: isErrorBills } = useGetBillDetails(roomId);
  const { data: tenant, isLoading: isLoadingTenant, isError: isErrorTenant } = useGetTenantByRoomId(roomId);

  if (isLoadingBills || isLoadingTenant) {
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

  if (isErrorBills || isErrorTenant) {
    return <div>Error fetching details</div>;
  }

  if (!tenant) {
    return <div>Tenant not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Room <span className="text-primary">{roomId}</span> Bill Details
      </h1>

      <TenantInfoCard tenant={tenant} />

      <BillDetails initialPaymentHistory={paymentHistory || []} roomId={parseInt(roomId)} />
    </div>
  );
}
