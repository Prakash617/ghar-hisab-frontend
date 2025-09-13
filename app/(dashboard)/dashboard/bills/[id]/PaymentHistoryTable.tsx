"use client";

import { PaymentHistory } from "@/lib/types";

type Props = {
  history: PaymentHistory[];
  onEdit: (index: number) => void;
  onMarkPaid: (index: number) => void; // ✅ new prop
};

export function PaymentHistoryTable({ history, onEdit, onMarkPaid }: Props) {
  return (
    <div className="rounded-2xl shadow-md overflow-x-auto border border-gray-200">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Month</th>
            <th className="p-3">Previous Units</th>
            <th className="p-3">Current Units</th>
            <th className="p-3">Consumed</th>
            <th className="p-3">Electricity</th>
            <th className="p-3">Water</th>
            <th className="p-3">Rent</th>
            <th className="p-3">Total</th>
            <th className="p-3">Status</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {history.length === 0 && (
            <tr>
              <td colSpan={10} className="text-center p-4 text-gray-500">
                No records found
              </td>
            </tr>
          )}

          {history.map((payment, index) => {
            const consumed = payment.currentUnits - payment.previousUnits;
            const total = payment.electricity.amount + payment.water.amount + payment.rent.amount;

            return (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{payment.month}</td>
                <td className="p-3">{payment.previousUnits}</td>
                <td className="p-3">{payment.currentUnits}</td>
                <td className="p-3">{consumed}</td>
                <td className="p-3">Rs. {payment.electricity.amount}</td>
                <td className="p-3">Rs. {payment.water.amount}</td>
                <td className="p-3">Rs. {payment.rent.amount}</td>
                <td className="p-3 font-semibold">Rs. {total}</td>
                <td
                  className={`p-3 font-semibold ${
                    payment.status === "Paid" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {payment.status}
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => onEdit(index)}
                    className="px-3 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Edit
                  </button>

                  {payment.status === "Unpaid" && (
                    <button
                      onClick={() => onMarkPaid(index)}
                      className="px-3 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700"
                    >
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
