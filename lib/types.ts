
export type PaymentHistory = {
  month: string;
  previousUnits: number;
  currentUnits: number;
  electricity: number;
  water: number;
  rent: number;
  status: "Paid" | "Unpaid";
};

export type Bill = {
    id: number;
    type: string;
    amount: number;
    status: "Paid" | "Pending";
}
