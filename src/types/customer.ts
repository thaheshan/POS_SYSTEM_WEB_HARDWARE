export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  creditLimit?: number;
  outstandingBalance: number;
  totalPurchases: number;
  isActive: boolean;
  createdAt: string;
}
