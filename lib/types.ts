export interface BillItem {
  amount: number;
  status: "Paid" | "Unpaid";
}

export type PaymentHistory = {
  id: number;
  month: string;
  previousUnits: number;
  currentUnits: number;
  electricity: BillItem;
  water: BillItem;
  rent: BillItem;
  total: number;
  status: "Paid" | "Unpaid" | "Partial";
  room: number;
};

export type Tenant = {
  name: string;
  contact: string;
  moveInDate: string;
};

export type Room = {
  id: number;
  room_number: string;
  tenant: Tenant;
};


export type Bill = {
    id: number;
    type: string;
    amount: number;
    status: "Paid" | "Pending";
}