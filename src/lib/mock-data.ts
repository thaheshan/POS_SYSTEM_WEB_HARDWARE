/*
   Contains `MOCK_CATEGORIES` and `MOCK_PRODUCTS` for local development and UI testing.
   Import from '@/lib/mock-data' when you need sample categories or products.
*/

import type { Product } from "@/types";
import type { ProductCategory } from "@/types/product";

export const MOCK_CATEGORIES: ProductCategory[] = [
  { id: "cat-beverages", name: "Beverages" },
  { id: "cat-grocery", name: "Grocery" },
  { id: "cat-electronics", name: "Electronics" },
  { id: "cat-household", name: "Household" },
  { id: "cat-personal-care", name: "Personal Care" },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-bev-001",
    name: "Pure Spring Water 1L",
    sku: "PSW-1L",
    barcode: "8901234567890",
    categoryId: "cat-beverages",
    price: 120,
    costPrice: 60,
    unit: "pcs",
    stockQty: 120,
    reorderLevel: 20,
    supplierId: "supp-001",
    imageUrl: "",
    isActive: true,
  },
  {
    id: "prod-gro-001",
    name: "Premium Rice 5kg",
    sku: "PR-5KG",
    barcode: "8901234567891",
    categoryId: "cat-grocery",
    price: 650,
    costPrice: 400,
    unit: "bag",
    stockQty: 45,
    reorderLevel: 10,
    supplierId: "supp-002",
    imageUrl: "",
    isActive: true,
  },
  {
    id: "prod-elec-001",
    name: "LED Bulb 9W",
    sku: "LED-9W",
    barcode: "8901234567892",
    categoryId: "cat-electronics",
    price: 450,
    costPrice: 250,
    unit: "pcs",
    stockQty: 200,
    reorderLevel: 50,
    supplierId: "supp-003",
    imageUrl: "",
    isActive: true,
  },
  {
    id: "prod-hh-001",
    name: "Multipurpose Cleaner 1L",
    sku: "MPC-1L",
    barcode: "8901234567893",
    categoryId: "cat-household",
    price: 280,
    costPrice: 150,
    unit: "bottle",
    stockQty: 30,
    reorderLevel: 10,
    supplierId: "supp-004",
    imageUrl: "",
    isActive: true,
  },
  {
    id: "prod-pc-001",
    name: "Hand Sanitizer 500ml",
    sku: "HS-500",
    barcode: "8901234567894",
    categoryId: "cat-personal-care",
    price: 350,
    costPrice: 180,
    unit: "bottle",
    stockQty: 75,
    reorderLevel: 15,
    supplierId: "supp-005",
    imageUrl: "",
    isActive: true,
  },
];
