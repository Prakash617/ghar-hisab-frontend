
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentHistory } from "@/lib/types";

interface PaymentHistoryTableProps {
    paymentHistory: PaymentHistory[];
    onEdit: (index: number) => void;
    onMarkPaid?: (index: number) => void;
}

export const PaymentHistoryTable = ({ paymentHistory, onEdit, onMarkPaid }: PaymentHistoryTableProps) => (
    <Card>
        <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>History of all payments.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Previous Units</TableHead>
                        <TableHead>Current Units</TableHead>
                        <TableHead>Electricity</TableHead>
                        <TableHead>Water</TableHead>
                        <TableHead>Rent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paymentHistory.map((payment, index) => (
                        <TableRow key={index}>
                            <TableCell>{payment.month}</TableCell>
                            <TableCell>{payment.previousUnits}</TableCell>
                            <TableCell>{payment.currentUnits}</TableCell>
                            <TableCell>Rs. {payment.electricity}</TableCell>
                            <TableCell>Rs. {payment.water}</TableCell>
                            <TableCell>Rs. {payment.rent}</TableCell>
                            <TableCell>
                                <Badge className={payment.status === "Paid" ? "bg-green-500" : "bg-red-500"}>{payment.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                                                <Button size="sm" variant="outline" onClick={() => onEdit(index)}>Edit</Button>
                                                                {onMarkPaid && payment.status !== "Paid" && (
                                                                    <Button size="sm" className="ml-2" variant="secondary" onClick={() => onMarkPaid(index)}>
                                                                        Mark Paid
                                                                    </Button>
                                                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);
