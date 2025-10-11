import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentHistory, PaymentStatus } from "@/lib/types";
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
    onEditItem: (paymentId: number, itemType: 'electricity' | 'water' | 'rent' | 'waste') => void;
    billId: string;
}

const BillItemCell = ({ amount, status, updatedAt, createdAt, isEditing, onFieldChange, onClick }: { amount: string, status: PaymentStatus, updatedAt: string | null, createdAt: string, isEditing: boolean, onFieldChange: (value: string) => void, onClick: () => void }) => {
    const statusColor = status === 'Paid' ? 'text-green-600' : status === 'Partially Paid' ? 'text-yellow-600' : 'text-red-600';
    const canClick = !isEditing;
    const dateToShow = updatedAt || createdAt;

    return (
        <TableCell>
            {isEditing ? (
                <Input type="text" value={amount} onChange={(e) => onFieldChange(e.target.value)} />
            ) : (
                <div>
                    <span className={`${statusColor} ${canClick ? 'cursor-pointer hover:underline' : ''}`} onClick={canClick ? onClick : undefined}>
                        Rs. {amount}
                    </span>
                    {dateToShow && <div className="text-xs text-gray-500">{new Date(dateToShow).toLocaleDateString()}</div>}
                </div>
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
    const { mutate: deletePaymentHistory } = useDeletePaymentHistory();
    const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<PaymentHistory | null>(null);

    const handleDeleteClick = (item: PaymentHistory) => {
        setItemToDelete(item);
        setShowDeleteConfirmDialog(true);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            deletePaymentHistory(String(itemToDelete.id));
            setShowDeleteConfirmDialog(false);
            setItemToDelete(null);
        }
    };

    const getBadgeClass = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-green-500';
            case 'Unpaid': return 'bg-red-500';
            case 'Partially Paid': return 'bg-yellow-500';
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
                                            <Input value={data.billing_month} onChange={(e) => onFieldChange("billing_month", e.target.value)} />
                                        ) : ( new Date(data.billing_month).toLocaleDateString() )}
                                    </TableCell>
                                    <TableCell>{data.previous_units}</TableCell>
                                    <TableCell>
                                        {isEditing ? (
                                            <Input type="number" value={data.current_units} onChange={(e) => onFieldChange("current_units", Number(e.target.value))} />
                                        ) : ( data.current_units )}
                                    </TableCell>
                                    
                                    <BillItemCell 
                                        amount={data.electricity} 
                                        status={data.electricity_status}
                                        updatedAt={data.electricity_updated_at}
                                        createdAt={data.created_at}
                                        isEditing={isEditing} 
                                        onFieldChange={(value) => onFieldChange('electricity', value)} 
                                        onClick={() => onEditItem(payment.id, 'electricity')} 
                                    />
                                    <BillItemCell 
                                        amount={data.water}
                                        status={data.water_status}
                                        updatedAt={data.water_updated_at}
                                        createdAt={data.created_at}
                                        isEditing={isEditing} 
                                        onFieldChange={(value) => onFieldChange('water', value)} 
                                        onClick={() => onEditItem(payment.id, 'water')} 
                                    />
                                    <BillItemCell 
                                        amount={data.rent} 
                                        status={data.rent_status}
                                        updatedAt={data.rent_updated_at}
                                        createdAt={data.created_at}
                                        isEditing={isEditing} 
                                        onFieldChange={(value) => onFieldChange('rent', value)} 
                                        onClick={() => onEditItem(payment.id, 'rent')} 
                                    />
                                    <BillItemCell 
                                        amount={data.waste} 
                                        status={data.waste_status}
                                        updatedAt={data.waste_updated_at}
                                        createdAt={data.created_at}
                                        isEditing={isEditing} 
                                        onFieldChange={(value) => onFieldChange('waste', value)} 
                                        onClick={() => onEditItem(payment.id, 'waste')} 
                                    />

                                    <TableCell>Rs. {data.total}</TableCell>
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