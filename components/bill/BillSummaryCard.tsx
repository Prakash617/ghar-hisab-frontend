import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PaymentReceived } from "@/lib/payment-received";

interface BillSummaryCardProps {
  payments: PaymentReceived[];
}

export const BillSummaryCard = ({ payments }: BillSummaryCardProps) => {
  const totalAmountDue = payments.length > 0 ? payments[0].total_amount_due : 0;
  const amountReceived = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const remainingAmount = payments.length > 0 ? payments[0].remaining_amount : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bill Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Total Unpaid Amount</span>
          <span className="text-2xl font-bold">Rs. {totalAmountDue.toFixed(2)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Amount Received</span>
          <span className="text-2xl font-bold">Rs. {amountReceived.toFixed(2)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Remaining Amount</span>
          <span className="text-2xl font-bold">Rs. {remainingAmount.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
