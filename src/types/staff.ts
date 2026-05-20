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