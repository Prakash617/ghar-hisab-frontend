
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ElectricityBillCardProps {
    previousUnits: number;
    currentUnits: number;
    setCurrentUnits: (value: number) => void;
    calculateElectricity: () => void;
    saveBill: () => void;
    editing: boolean;
    saveEdited: () => void;
    electricityRate: number;
    unitsConsumed: number;
    calculatedAmount: number;
    editingMonth?: string;
}

export const ElectricityBillCard = ({ previousUnits, currentUnits, setCurrentUnits, calculateElectricity, saveBill, editing, saveEdited, electricityRate, unitsConsumed, calculatedAmount, editingMonth }: ElectricityBillCardProps) => (
    <Card>
        <CardHeader>
            <CardTitle>Electricity Bill Calculator</CardTitle>
            <CardDescription>{editing ? `Editing bill for ${editingMonth}` : "Calculate and save the monthly electricity bill."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="font-semibold">Previous Reading: <span className="font-mono p-1 bg-muted rounded">{previousUnits}</span> units</p>
            <div className="flex items-center gap-2">
                <Input
                    type="number"
                    placeholder="Enter current meter reading"
                    value={currentUnits || ''}
                    onChange={(e) => setCurrentUnits(Number(e.target.value))}
                />
                <Button onClick={calculateElectricity}>Calculate</Button>
            </div>
            <div className="text-sm text-muted-foreground">
                <p>Rate per unit: Rs. {electricityRate}</p>
                <p>Units Consumed: {unitsConsumed} units</p>
            </div>
            <p className="text-lg font-bold">Total Electricity Bill: Rs. {calculatedAmount}</p>
            <div className="flex justify-end gap-2">
                {editing ? (
                    <Button onClick={saveEdited} className="bg-green-600 hover:bg-green-700 text-white">Save Changes</Button>
                ) : (
                    <Button onClick={saveBill} className="bg-blue-600 hover:bg-blue-700 text-white">Save Bill for this Month</Button>
                )}
            </div>
        </CardContent>
    </Card>
);
