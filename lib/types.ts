export interface BillItem {
  amount: number;
  status: "Paid" | "Unpaid";
}

export type PaymentHistory = {
  month: string;
  previousUnits: number;
  currentUnits: number;
  electricity: BillItem;
  water: BillItem;
  rent: BillItem;
  status: "Paid" | "Unpaid" | "Partial";
};


export type Bill = {
    id: number;
    type: string;
    amount: number;
    status: "Paid" | "Pending";
}