"use client";

import { useState, useMemo, use } from "react";
import { TenantInfoCard } from "@/components/bill/TenantInfoCard";
import { ElectricityBillCard } from "@/components/bill/ElectricityBillCard";
import { BillsTable } from "@/components/bill/BillsTable";
import { PaymentHistoryTable } from "@/components/bill/PaymentHistoryTable";
import { Bill, PaymentHistory } from "@/lib/types";

// --- DUMMY DATA ---
const tenants: Record<string, { name: string; contact: string; moveInDate: string }> = {
  "101": { name: "John Doe", contact: "9812345678", moveInDate: "2025-01-15" },
  "102": { name: "Jane Smith", contact: "9876543210", moveInDate: "2025-02-01" },
};

// --- FAKE PAYMENT HISTORY ---
const fakePaymentHistory: PaymentHistory[] = [
  {
    month: "January 2025",
    previousUnits: 1000,
    currentUnits: 1100,
    electricity: 1300,
    water: 500,
    rent: 10000,
    status: "Paid",
  },
  {
    month: "February 2025",
    previousUnits: 1100,
    currentUnits: 1220,
    electricity: 1560,
    water: 500,
    rent: 10000,
    status: "Paid",
  },
  {
    month: "March 2025",
    previousUnits: 1220,
    currentUnits: 1340,
    electricity: 1560,
    water: 500,
    rent: 10000,
    status: "Unpaid",
  },
  {
    month: "April 2025",
    previousUnits: 1340,
    currentUnits: 1450,
    electricity: 1430,
    water: 500,
    rent: 10000,
    status: "Unpaid",
  },
];

// --- INITIAL BILLS ---
const initialBills: Bill[] = [
  { id: 1, type: "Rent", amount: 10000, status: "Pending" },
  { id: 2, type: "Electricity", amount: 1500, status: "Pending" },
  { id: 3, type: "Water", amount: 500, status: "Paid" },
];

// --- MAIN PAGE COMPONENT ---
export default function BillsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: roomId } = use(params);
  const electricityRate = 13;
  const waterFixed = 500;
  const rentAmount = 10000;

  const tenant = useMemo(() => tenants[roomId], [roomId]);

  const [paymentHistory, setPaymentHistory] =
    useState<PaymentHistory[]>(fakePaymentHistory);
  const [bills, setBills] = useState<Bill[]>(initialBills);

  const [previousUnits, setPreviousUnits] = useState(() =>
    paymentHistory.length > 0
      ? paymentHistory[paymentHistory.length - 1].currentUnits
      : 0
  );
  const [currentUnits, setCurrentUnits] = useState(0);
  const [unitsConsumed, setUnitsConsumed] = useState(0);
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // --- Calculate Electricity ---
  const calculateElectricity = () => {
    if (currentUnits < previousUnits) {
      alert("Current reading cannot be less than previous reading");
      return;
    }
    const consumed = currentUnits - previousUnits;
    const amount = consumed * electricityRate;
    setUnitsConsumed(consumed);
    setCalculatedAmount(amount);
  };

  // --- Save new month bill ---
  const saveBillForNewMonth = () => {
    if (currentUnits <= previousUnits) {
      alert(
        "Current reading must be greater than previous reading to save a new bill."
      );
      return;
    }
    const now = new Date();
    const month = now.toLocaleString("default", { month: "long", year: "numeric" });

    setPaymentHistory([
      ...paymentHistory,
      {
        month,
        previousUnits,
        currentUnits,
        electricity: calculatedAmount,
        water: waterFixed,
        rent: rentAmount,
        status: "Unpaid",
      },
    ]);

    setPreviousUnits(currentUnits);
    setCurrentUnits(0);
    setUnitsConsumed(0);
    setCalculatedAmount(0);
  };

  // --- Mark Bill Paid ---
  const handleMarkBillPaid = (billId: number) => {
    setBills(
      bills.map((bill) =>
        bill.id === billId ? { ...bill, status: "Paid" } : bill
      )
    );
  };

  // --- Edit Payment ---
  const editPayment = (index: number) => {
    const payment = paymentHistory[index];
    setPreviousUnits(payment.previousUnits);
    setCurrentUnits(payment.currentUnits);
    setUnitsConsumed(payment.currentUnits - payment.previousUnits);
    setCalculatedAmount(payment.electricity);
    setEditingIndex(index);
  };

  // --- Save Edited Payment ---
  const saveEditedPayment = (
    index: number,
    data: Partial<PaymentHistory>
  ) => {
    const updatedHistory = [...paymentHistory];
    const electricity =
      (data.currentUnits! - updatedHistory[index].previousUnits) *
      electricityRate;
    updatedHistory[index] = { ...updatedHistory[index], ...data, electricity };

    if (index + 1 < updatedHistory.length) {
      updatedHistory[index + 1].previousUnits = data.currentUnits!;
    }

    setPaymentHistory(updatedHistory);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Room <span className="text-primary">{roomId}</span> Bill Details
      </h1>

      <TenantInfoCard tenant={tenant} />

      <ElectricityBillCard
        previousUnits={previousUnits}
        currentUnits={currentUnits}
        setCurrentUnits={setCurrentUnits}
        calculateElectricity={calculateElectricity}
        saveBill={saveBillForNewMonth}
        editing={editingIndex !== null}
        saveEdited={() => {
          if (editingIndex !== null) {
            saveEditedPayment(editingIndex, {
              currentUnits: currentUnits,
            });
            setEditingIndex(null);
            const lastReading =
              paymentHistory.length > 0
                ? paymentHistory[paymentHistory.length - 1].currentUnits
                : 0;
            setPreviousUnits(lastReading); // ✅ fixed typo
            setCurrentUnits(0);
            setUnitsConsumed(0);
            setCalculatedAmount(0);
          }
        }}
        electricityRate={electricityRate}
        unitsConsumed={unitsConsumed}
        calculatedAmount={calculatedAmount}
        editingMonth={
          editingIndex !== null ? paymentHistory[editingIndex].month : undefined
        }
      />

      <BillsTable bills={bills} onMarkPaid={handleMarkBillPaid} />

      <PaymentHistoryTable
        paymentHistory={paymentHistory}
        onEdit={editPayment}
        onMarkPaid={(index: number) => {
          const updated = [...paymentHistory];
          updated[index].status = "Paid";
          setPaymentHistory(updated);
        }}
      />
    </div>
  );
}
