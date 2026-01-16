export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface Sale {
  id: string;
  saleNumber: string;
  customerId?: string;
  customerName?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'credit';
  status: 'completed' | 'pending' | 'cancelled';
  cashierId: string;
  cashierName: string;
  notes?: string;
  createdAt: string;
}
