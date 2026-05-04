export const staffRole = [
  { id: "manager", label: "Manager" },
  { id: "cashier", label: "Cashier" },
  { id: "store_keeper", label: "Store Keeper" },
  { id: "accountant", label: "Accountant" },
] as const;

export interface StaffRegistrationPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  tenant_id: string;
  shop_id: string;
  role: typeof staffRole[number]['id'];
  password: string;
}

export interface StaffMemberResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  created_at: string;
}