export type StockSeverity = "Critical" | "Very Low" | "Low";

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  reorderQty: number;
  lastSale: string;
  unitsSold: number;
  unitCost: number;
}

export const lowStockProducts: LowStockProduct[] = [
  {
    id: "ls-001",
    name: "Holcim Cement 50kg",
    sku: "CEM-50-001",
    category: "PVC Items",
    currentStock: 0,
    reorderLevel: 50,
    reorderQty: 50,
    lastSale: "2 hours ago",
    unitsSold: 5,
    unitCost: 8250,
  },
  {
    id: "ls-002",
    name: "LED Bulb 9W",
    sku: "ELE-BULB-009",
    category: "Bulbs & Lighting",
    currentStock: 3,
    reorderLevel: 30,
    reorderQty: 30,
    lastSale: "Yesterday",
    unitsSold: 12,
    unitCost: 1350,
  },
  {
    id: "ls-003",
    name: "2-inch Steel Nails 1kg",
    sku: "HARD-NAIL-002",
    category: "Nuts & Bolts",
    currentStock: 8,
    reorderLevel: 50,
    reorderQty: 42,
    lastSale: "3 days ago",
    unitsSold: 17,
    unitCost: 2250,
  },
  {
    id: "ls-004",
    name: "Electric Wire 2.5mm",
    sku: "ELE-WR-025",
    category: "Electrical Items",
    currentStock: 0,
    reorderLevel: 100,
    reorderQty: 100,
    lastSale: "5 hours ago",
    unitsSold: 30,
    unitCost: 4500,
  },
  {
    id: "ls-005",
    name: "Claw Hammer 500g",
    sku: "TOOL-HAM-500",
    category: "Tools & Equipment",
    currentStock: 4,
    reorderLevel: 25,
    reorderQty: 21,
    lastSale: "1 day ago",
    unitsSold: 8,
    unitCost: 18750,
  },
  {
    id: "ls-006",
    name: "Asian Paint White 4L",
    sku: "PNT-WH-004",
    category: "Paint",
    currentStock: 12,
    reorderLevel: 40,
    reorderQty: 28,
    lastSale: "Today",
    unitsSold: 4,
    unitCost: 3200,
  },
];

export function getStockSeverity(product: LowStockProduct): StockSeverity {
  if (product.currentStock === 0) {
    return "Critical";
  }

  if (product.currentStock <= Math.ceil(product.reorderLevel * 0.35)) {
    return "Very Low";
  }

  return "Low";
}

export function getInventoryValueAtRisk(product: LowStockProduct): number {
  const unitsAtRisk = Math.max(product.reorderLevel - product.currentStock, 0);
  return unitsAtRisk * product.unitCost;
}
