export type UserRole = 'admin' | 'manager' | 'cashier';
export type PaymentMethod = 'cash' | 'card' | 'credit' | 'bank_transfer';
export type OrderStatus = 'pending' | 'sent' | 'received' | 'cancelled';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  price: number;
  costPrice: number;
  unit: string;
  stockQty: number;
  reorderLevel: number;
  supplierId?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface InventoryItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  reorderLevel: number;
  location?: string;
  lastUpdated: string;
}

export interface SaleItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  items: SaleItem[];
  customerId?: string;
  cashierId: string;
  subtotal: number;
  discount: number;
  taxVAT: number;
  taxNBT: number;
  total: number;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  change: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  creditLimit: number;
  totalPurchases: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  paymentTerms: string;
  productsSupplied: string[];
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplier: Supplier;
  items: SaleItem[];
  status: OrderStatus;
  totalAmount: number;
  orderedAt: string;
  receivedAt?: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface TaxBreakdown {
  subtotal: number;
  vatAmount: number;
  nbtAmount: number;
  total: number;
  vatRate: number;
  nbtRate: number;
}
