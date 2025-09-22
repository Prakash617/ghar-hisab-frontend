export interface BillItem {
  amount: number;
  status: "Paid" | "Unpaid";
}

export type PaymentHistory = {
  id: number;
  roomId: number;
  month: string;
  previousUnits: number;
  currentUnits: number;
  electricity: BillItem;
  water: BillItem;
  rent: BillItem;
  total: number;
  status: "Paid" | "Unpaid" | "Partial";
};

export type Tenant = {
  id: number;
  roomId: number;
  name: string;
  contact: string;
  moveInDate: string;
};

export type Room = {
  id: number;
  house: number;
  room_number: string;
  is_occupied: boolean;
};

export type House = {
  id: number;
  name: string;
  address: string;
};