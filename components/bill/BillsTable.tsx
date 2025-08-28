
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bill } from "@/lib/types";

export const BillsTable = ({ bills, onMarkPaid }: { bills: Bill[], onMarkPaid: (billId: number) => void }) => (
    <Card>
        <CardHeader>
            <CardTitle>Current Bills</CardTitle>
            <CardDescription>Overview of outstanding and paid bills for the current cycle.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bills.map((bill) => (
                        <TableRow key={bill.id}>
                            <TableCell>{bill.type}</TableCell>
                            <TableCell>Rs. {bill.amount}</TableCell>
                            <TableCell>
                                <Badge className={bill.status === "Paid" ? "bg-green-500" : "bg-yellow-500"}>{bill.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {bill.status === "Pending" && (
                                    <Button size="sm" onClick={() => onMarkPaid(bill.id)}>Mark as Paid</Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);
