export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];
    pagination: {
      nextCursor: string | null;
      hasMore: boolean;
      limit: number;
    };
  };
}

export interface AdjustStockPayload {
  action: 'add' | 'deduct';
  product_id: string;
  warehouse_id: string;
  branch_id: string;
  add_quantity?: number;
  deduct_quantity?: number;
  reason: string;
}

export interface InventoryItem {
  id: string;
  tenantId: string;
  productId: string;
  variantId?: string | null;
  warehouseId: string;
  branchId: string;

  quantity: string;
  reservedQuantity: string;
  availableQuantity?: string | null;
  damagedQuantity: string;

  product: {
    id: string;
    name: string;
    sku: string;
    barcode: string;
    reorderLevel?: number;
  };

  warehouse: {
    id: string;
    warehouseName: string;
    warehouseCode: string;
  };
}
