export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  description?: string;
  price: number;
  cost: number;
  quantity: number;
  category: string;
  brand?: string;
  unit: string;
  minStock: number;
  maxStock: number;
  reorderLevel: number;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
}
