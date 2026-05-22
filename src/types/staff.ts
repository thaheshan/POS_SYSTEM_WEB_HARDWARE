export const staffRole = [
  { id: "OWNER", label: "Owner" },
  { id: "MANAGER", label: "Manager" },
  { id: "CASHIER", label: "Cashier" },
  { id: "STORE_KEEPER", label: "Store Keeper" },
  { id: "ACCOUNTANT", label: "Accountant" },
  { id: "TECHNICIAN", label: "Technician" },
] as const;

export interface StaffRegistrationPayload {
  full_name: string;
  email: string;
  mobile_number: string;
  shop_id: string;
  role: typeof staffRole[number]['id'];
  password: string;
}

export interface StaffMemberResponse {
  id: string;
  full_name: string;
  email: string;
  mobile_number: string;
  status: string;
  created_at: string;
}

export interface AuthUser {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  tenant_id?: string;
  shop_id?: string; 
  role?: string;
}