
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentHistory } from "@/lib/types";

export const BillsTable = ({ bills, onMarkPaid }: { bills: PaymentHistory[], onMarkPaid: (billId: number) => void }) => (
    <Card>
        <CardHeader>
            <CardTitle>Bills</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Bill Month</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bills.map((bill) => (
                        <TableRow key={bill.id}>
                            <TableCell>{new Date(bill.billing_month).toLocaleDateString()}</TableCell>
                            <TableCell>{bill.total}</TableCell>
                            <TableCell>{bill.total_paid}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={bill.status === "Paid" ? "default" : bill.status === "Partially Paid" ? "secondary" : "destructive"}
                                >
                                    {bill.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onMarkPaid(bill.id)}
                                    disabled={bill.status === "Paid"}
                                >
                                    Mark as Paid
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);
