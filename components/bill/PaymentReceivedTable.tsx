import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PaymentReceived } from "@/lib/payment-received";
import { useGetPaymentReceivedByTenantId } from "@/hooks/bills/useGetPaymentReceivedByTenantId";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EditPaymentModal } from "./EditPaymentModal";
import { DeletePaymentModal } from "./DeletePaymentModal";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface PaymentReceivedTableProps {
  tenantId: string;
}

export const PaymentReceivedTable = ({ tenantId }: PaymentReceivedTableProps) => {
  const queryClient = useQueryClient();
  const { data: payments, isLoading, isError } = useGetPaymentReceivedByTenantId(tenantId);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentReceived | null>(null);

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-500';
      case 'Unpaid': return 'bg-red-500';
      case 'Partially Paid': return 'bg-yellow-500';
      case 'Overpaid': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const handleEdit = (payment: PaymentReceived) => {
    setSelectedPayment(payment);
    setIsEditModalOpen(true);
  };

  const handleDelete = (payment: PaymentReceived) => {
    setSelectedPayment(payment);
    setIsDeleteModalOpen(true);
  };

  const handlePaymentActionSuccess = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.paymentReceived(tenantId) });
  };

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  if (isError) {
    return <div>Error loading payment history.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Received History</CardTitle>
        <CardDescription>History of all payments received from this tenant.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Total Amount Due</TableHead>
              <TableHead>Remaining Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments?.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{new Date(payment.received_date).toLocaleDateString()}</TableCell>
                <TableCell>Rs. {Number(payment.amount).toFixed(2)}</TableCell>
                <TableCell>{payment.remarks || '-'}</TableCell>
                <TableCell>
                  <Badge className={getBadgeClass(payment.status)}>{payment.status}</Badge>
                </TableCell>
                <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                <TableCell>Rs. {Number(payment.total_amount_due).toFixed(2)}</TableCell>
                <TableCell>Rs. {Number(payment.remaining_amount).toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(payment)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(payment)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {selectedPayment && (
        <EditPaymentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          payment={selectedPayment}
          onPaymentUpdated={handlePaymentActionSuccess}
        />
      )}

      {selectedPayment && (
        <DeletePaymentModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          payment={selectedPayment}
          onPaymentDeleted={handlePaymentActionSuccess}
        />
      )}
    </Card>
  );
};