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
  waste: BillItem;
  total: BillItem;
  status: "Paid" | "Unpaid" | "Partial";
  electricity_status: "Paid" | "Unpaid";
  water_status: "Paid" | "Unpaid";
  rent_status: "Paid" | "Unpaid";
  waste_status: "Paid" | "Unpaid";
};

export type Tenant = {
  id: number;
  roomId: number;
  name: string;
  contact: string;
  moveInDate: string;
  electricityPricePerUnit: string;
  water_price: string;
  rent_price: string;
  waste_price: string;
  documents: { id: number; document: string; }[];
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