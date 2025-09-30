import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentHistory, BillItem } from "@/lib/types";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeletePaymentHistory } from "@/hooks/bills/useDeletePaymentHistory";

interface PaymentHistoryTableProps {
    paymentHistory: PaymentHistory[];
    editingIndex: number | null;
    editedData: PaymentHistory | null;
    onEdit: (index: number) => void;
    onSave: () => void;
    onCancel: () => void;
    onFieldChange: (fieldName: keyof PaymentHistory, value: string | number) => void;
    onEditItem: (paymentId: number, itemType: 'electricity' | 'water' | 'rent' | 'waste', itemData: BillItem) => void;
    billId: string;
}

const BillItemCell = ({ item, isEditing, onFieldChange, onClick }: { item: BillItem, isEditing: boolean, onFieldChange: (value: number) => void, onClick: () => void }) => {
    const statusColor = item.status === 'Paid' ? 'text-green-600' : 'text-red-600';
    const canClick = !isEditing;

    return (
        <TableCell>
            {isEditing ? (
                <Input type="number" value={item.amount} onChange={(e) => onFieldChange(Number(e.target.value))} />
            ) : (
                <span className={`${statusColor} ${canClick ? 'cursor-pointer hover:underline' : ''}`} onClick={canClick ? onClick : undefined}>
                    Rs. {item.amount}
                </span>
            )}
        </TableCell>
    )
}

export const PaymentHistoryTable = ({
    paymentHistory,
    editingIndex,
    editedData,
    onEdit,
    onSave,
    onCancel,
    onFieldChange,
    onEditItem,
    billId
}: PaymentHistoryTableProps) => {
    const { mutate: deletePaymentHistory } = useDeletePaymentHistory(billId);
    const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<PaymentHistory | null>(null);

    const handleDeleteClick = (item: PaymentHistory) => {
        setItemToDelete(item);
        setShowDeleteConfirmDialog(true);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            deletePaymentHistory(itemToDelete.id);
            setShowDeleteConfirmDialog(false);
            setItemToDelete(null);
        }
    };

    const getBadgeClass = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-green-500';
            case 'Unpaid': return 'bg-red-500';
            case 'Partial': return 'bg-yellow-500';
            default: return 'bg-gray-400';
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>History of all payments. Click on an amount to edit it.</CardDescription>
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
                            <TableHead>Waste</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paymentHistory.map((payment, index) => {
                            const isEditing = index === editingIndex;
                            const data = isEditing && editedData ? editedData : payment;

                            return (
                                <TableRow key={index}>
                                    <TableCell>
                                        {isEditing ? (
                                            <Input value={data.month} onChange={(e) => onFieldChange("month", e.target.value)} />
                                        ) : ( data.month )}
                                    </TableCell>
                                    <TableCell>{data.previousUnits}</TableCell>
                                    <TableCell>
                                        {isEditing ? (
                                            <Input type="number" value={data.currentUnits} onChange={(e) => onFieldChange("currentUnits", Number(e.target.value))} />
                                        ) : ( data.currentUnits )}
                                    </TableCell>
                                    
                                    <BillItemCell 
                                        item={data.electricity} 
                                        isEditing={isEditing} 
                                        onFieldChange={(value) => onFieldChange('electricity', value)} 
                                        onClick={() => { console.log("Payment ID from table:", payment.id); onEditItem(payment.id, 'electricity', data.electricity); }} 
                                    />
                                    <BillItemCell 
                                        item={data.water} 
                                        isEditing={isEditing} 
                                        onFieldChange={(value) => onFieldChange('water', value)} 
                                        onClick={() => { console.log("Payment ID from table:", payment.id); onEditItem(payment.id, 'water', data.water); }} 
                                    />
                                    <BillItemCell 
                                        item={data.rent} 
                                        isEditing={isEditing} 
                                        onFieldChange={(value) => onFieldChange('rent', value)} 
                                        onClick={() => { console.log("Payment ID from table:", payment.id); onEditItem(payment.id, 'rent', data.rent); }} 
                                    />
                                    <BillItemCell 
                                        item={data.waste} 
                                        isEditing={isEditing} 
                                        onFieldChange={(value) => onFieldChange('waste', value)} 
                                        onClick={() => { console.log("Payment ID from table:", payment.id); onEditItem(payment.id, 'waste', data.waste); }} 
                                    />

                                    <TableCell>Rs. {data.total.amount}</TableCell>
                                    <TableCell>
                                        <Badge className={getBadgeClass(data.status)}>{data.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {isEditing ? (
                                            <>
                                                <Button size="sm" variant="outline" onClick={onSave}>Save</Button>
                                                <Button size="sm" variant="ghost" onClick={onCancel} className="ml-2">Cancel</Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button size="sm" variant="outline" onClick={() => onEdit(index)}>Edit</Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(payment)} className="ml-2">Delete</Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>

            <AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this bill entry? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
};