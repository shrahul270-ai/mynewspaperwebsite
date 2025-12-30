/* ========= COMMON TYPES ========= */

export type Gender = "male" | "female" | "other";

/* ========= AGENT ========= */

export interface AgentProfile {
  id: number;
  full_name: string;
  mobile: string;
  email: string;

  address: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  pincode: string;

  agency_name: string;
  agency_phone: string;

  age: number;
  gender: Gender;

  photo: string; // image URL
  created_at: string;
}

/* ========= CUSTOMER ========= */

export interface CustomerProfile {
  id: number;
  agent?: AgentProfile | number | null;

  name: string;
  surname: string;
  mobile: string;
  email: string;

  address: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  pincode: string;

  age: number;
  gender: Gender;

  photo: string;
  created_at: string;
}

/* ========= HOKER ========= */

export interface HokerProfile {
  id: number;
  full_name: string;
  mobile: string;
  email: string;

  address: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  pincode: string;

  age: number;
  gender: Gender;

  photo?: string | null;
  created_at: string;
}

/* ========= ALLOTMENTS ========= */

export interface AllotedCustomer {
  id: number;
  agent: AgentProfile | number;
  customer: CustomerProfile | number;

  PB: number;
  BH: number;
  HT: number;
  TIMES: number;
  HINDU: number;

  is_active: boolean;
  allotted_on: string;
}

export interface AllotedHoker {
  id: number;
  agent: AgentProfile | number;
  hoker: HokerProfile | number;

  is_active: boolean;
  allotted_on: string;
}

/* ========= DELIVERY ========= */

export interface HokerDelivery {
  id: number;
  hoker: HokerProfile | number;
  customer: CustomerProfile | number;

  date: string;

  newspaper_present: boolean;
  booklet_present: boolean;
  is_delivered: boolean;

  remarks?: string;
}

export interface ExtraDelivery {
  id: number;
  delivery: HokerDelivery | number;
  newspaper: Newspaper | number;
  quantity: number;
}

/* ========= PRODUCTS ========= */

export interface Newspaper {
  id: number;
  name: string;
  language: string;
  price: number;
}

export interface Booklet {
  id: number;
  title: string;
  price: number;
  description?: string;
}

/* ========= PURCHASE ========= */

export interface PurchaseNewspaper {
  id: number;
  customer: CustomerProfile | number;
  newspaper: Newspaper | number;

  start_date: string;
  is_active: boolean;
}

export interface PurchaseBooklet {
  id: number;
  customer: CustomerProfile | number;
  booklet: Booklet | number;

  start_date: string;
  is_active: boolean;
}

/* ========= PAYMENTS ========= */

export interface AgentPayment {
  id: number;
  agent: AgentProfile | number;
  amount: number;
  remarks?: string;
  date: string;
}

export interface HokerPayment {
  id: number;
  hoker: HokerProfile | number;
  agent: AgentProfile | number;

  amount: number;
  remarks?: string;
  date: string;
}

/* ========= ATTENDANCE ========= */

export interface HokerAttendance {
  id: number;
  hoker: HokerProfile | number;
  date: string;

  is_present: boolean;
  half_time: boolean;
  remarks?: string;
}

/* ========= BILLING ========= */

export interface MonthlyBill {
  id: number;

  customer: CustomerProfile | number;
  agent: AgentProfile | number;

  month: number; // 1-12
  year: number;

  days_on_delivery: number[];
  total_delivery_days: number;

  base_amount: number;
  late_charges: number;
  total_amount: number;

  created_at: string;
  last_submit_date: string;

  is_paid: boolean;
  paid_on?: string | null;

  remarks?: string;
}
