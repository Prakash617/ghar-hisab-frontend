export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface House {
  id: number;
  name: string;
  address?: string;
  contact_number?: string;
  is_active: boolean;
  created_at?: string;
  rooms_count?: number;
  room_count?: number;
  occupied_count?: number;
  vacant_count?: number;
}

export interface Room {
  id: number;
  house: number;
  house_name?: string;
  room_name?: string;
  room_number: string;
  rent_amount?: string;
  floor?: number;
  is_active: boolean;
  is_occupied?: boolean;
  tenant?: Tenant;
}

export interface Tenant {
  id: number;
  room: number;
  roomId?: number;
  roomName?: string;
  houseName?: string;
  name?: string;
  full_name?: string;
  contact?: string;
  phone_number?: string;
  email?: string;
  email_verified?: boolean;
  client_code?: string;
  moveInDate?: string;
  move_in_date?: string;
  electricityPricePerUnit?: string;
  electricity_price_per_unit?: string;
  water_price?: string;
  rent_price?: string;
  waste_price?: string;
  internet_price?: string;
  initial_unit?: number;
  opening_balance?: string;
  opening_balance_paid?: string;
  created_at?: string;
  documents?: TenantDocument[];
}

export interface TenantDocument {
  id: number;
  tenant: number;
  name?: string;
  document?: string;
  document_type?: string;
  document_file?: string;
  uploaded_at?: string;
}

export interface Billing {
  id: number;
  room: number;
  month: string;
  electricity_previous: string;
  electricity_current: string;
  electricity_units: string;
  electricity_price: string;
  electricity_amount: string;
  water_amount: string;
  rent_amount: string;
  waste_amount: string;
  internet_amount: string;
  total_amount: string;
  total_paid: string;
  status: "Unpaid" | "Partially Paid" | "Paid";
}

export interface PaymentHistory {
  id: number;
  room: number;
  roomId?: number;
  roomName?: string;
  room_number?: string;
  houseName?: string;
  tenant_name?: string;
  amount?: string;
  total?: string;
  total_paid?: string;
  due_amount?: string;
  billing_month?: string;
  previous_units?: number;
  current_units?: number;
  electricity?: string;
  water?: string;
  rent?: string;
  waste?: string;
  internet?: string;
  status?: "Unpaid" | "Partially Paid" | "Paid" | string;
  payment_date?: string;
  payment_received_date?: string;
  payment_method?: string;
  notes?: string;
  remarks?: string;
  is_meter_reset?: boolean;
  meter_reset_reason?: string;
  old_meter_reading?: number;
  new_meter_start_reading?: number;
  additional_units?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentReceipt {
  id: number;
  room?: number;
  tenant?: number;
  tenant_name?: string;
  payment?: number;
  receipt_number?: string;
  received_date?: string;
  amount: string;
  allocated_amount?: string;
  unapplied_amount?: string;
  remarks?: string;
  created_at?: string;
  allocations?: PaymentAllocation[];
}

export interface PaymentAllocation {
  id: number;
  receipt: number;
  payment_history?: number;
  billing?: number;
  tenant?: number;
  amount_allocated: string;
  allocated_at?: string;
  billing_month?: string;
  payment_status?: string;
}

export interface SentEmailHistory {
  id: number;
  room?: number;
  room_name?: string;
  house_name?: string;
  payment?: number;
  room_number?: string;
  tenant_name?: string;
  recipient_name?: string;
  recipient_email: string;
  subject: string;
  body?: string;
  sent_at: string;
  status?: "sent" | "failed" | string;
}

export interface DashboardData {
  houses?: House[];
  total_houses: number;
  total_rooms: number;
  total_tenants?: number;
  total_active_tenants: number;
  total_collected: string;
  total_pending: string;
  occupancy_rate?: string;
  recent_payments: PaymentHistory[];
  stats?: {
    total_rooms: number;
    occupied_rooms: number;
    vacant_rooms: number;
    occupied_percent: number;
    monthly_income: string;
    annual_income: string;
    remaining_amount: string;
    overdue_count: number;
  };
  monthly_summary?: {
    month: string;
    collected: string;
    pending: string;
  };
}

export interface EmailSettings {
  id: number;
  smtp_host: string;
  smtp_port: number;
  use_tls: boolean;
  email_host_user: string;
  is_configured: boolean;
}
