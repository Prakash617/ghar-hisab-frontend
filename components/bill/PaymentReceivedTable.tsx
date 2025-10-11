"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { DataTable } from "@/components/ui/data-table";
import { PaymentReceived } from "@/lib/payment-received";
import { Badge } from "@/components/ui/badge";
import { useGetPaymentReceivedByTenantId } from "@/hooks/bills/useGetPaymentReceivedByTenantId";
import { useDeletePaymentReceived } from "@/hooks/bills/useDeletePaymentReceived";
import { useUpdatePaymentReceived } from "@/hooks/bills/useUpdatePaymentReceived";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { AddPaymentModal } from "./AddPaymentModal";
import { EditPaymentModal } from "./EditPaymentModal";
import { DeletePaymentModal } from "./DeletePaymentModal";

interface PaymentReceivedTableProps {
  tenantId: string;
}

export const PaymentReceivedTable = ({
  tenantId,
}: PaymentReceivedTableProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentReceived | undefined>();

    const { data: payments, isLoading } =

      useGetPaymentReceivedByTenantId(tenantId);

    const { mutate: deletePayment } = useDeletePaymentReceived(tenantId);

    const { mutate: updatePayment } = useUpdatePaymentReceived(tenantId);

  const columns: ColumnDef<PaymentReceived>[] = [
    {
      accessorKey: "amount",
      header: "Amount",
    },
    {
      accessorKey: "received_date",
      header: "Payment Date",
      cell: ({ row }) => {
        const date: Date = row.getValue("received_date");
        return <span>{format(new Date(date), "PPP")}</span>;
      },
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status: string = row.getValue("status");
        return (
          <Badge
            className={`${
              status === "Paid" ? "bg-green-500" : "bg-red-500"
            } text-white`}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date: Date = row.getValue("created_at");
        return <span>{format(new Date(date), "PPP")}</span>;
      },
    },
    {
      accessorKey: "total_amount_due",
      header: "Total Amount Due",
    },
    {
      accessorKey: "remaining_amount",
      header: "Remaining Amount",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const payment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPayment(payment);
                  setIsEditModalOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPayment(payment);
                  setIsDeleteModalOpen(true);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ]; // Missing closing bracket for the columns array


  if (isLoading) {
    return <div>Loading payments...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {/* <Button onClick={() => setIsAddModalOpen(true)}>
          Add New Payment
        </Button> */}
      </div>
      <DataTable columns={columns} data={payments || []} />
      {/* <AddPaymentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        tenantId={tenantId}
      /> */}
      {selectedPayment && (
        <EditPaymentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          payment={selectedPayment}
          onPaymentUpdated={() => {
            setIsEditModalOpen(false);
            queryClient.invalidateQueries({ queryKey: queryKeys.paymentReceived(tenantId) });
          }}
        />
      )}
      {selectedPayment && (
        <DeletePaymentModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          payment={selectedPayment}
          onPaymentDeleted={() => {
            setIsDeleteModalOpen(false);
            queryClient.invalidateQueries({ queryKey: queryKeys.paymentReceived(tenantId) });
          }}
        />
      )}
    </div>
  );
};