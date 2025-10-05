export type PaymentStatus = "Paid" | "Unpaid" | "Partially Paid";

export type PaymentHistory = {
  id: number;
  roomId: number;
  billing_month: string;
  previous_units: number;
  current_units: number;
  electricity: string;
  electricity_paid: string;
  electricity_status: PaymentStatus;
  electricity_updated_at: string | null;
  water: string;
  water_paid: string;
  water_status: PaymentStatus;
  water_updated_at: string | null;
  rent: string;
  rent_paid: string;
  rent_status: PaymentStatus;
  rent_updated_at: string | null;
  waste: string;
  waste_paid: string;
  waste_status: PaymentStatus;
  waste_updated_at: string | null;
  total: string;
  total_paid: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
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

export type TenantData = {
  name: string;
  contact: string;
  moveInDate: string;
  electricityPricePerUnit: string;
  water_price: string;
  rent_price: string;
  waste_price: string;
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