// Common Report Types
export interface ShopDetails {
    logoUrl?: string;
    name: string;
    address: string;
    contactNumber: string;
    email: string;
    registrationNumber?: string;
}

export interface ReportMetadata {
    title: string;
    generatedDate: string;
    generatedTime: string;
    generatedBy: string;
}

export interface ReportHeaderProps {
    shopDetails: ShopDetails;
    metadata: ReportMetadata;
}

export interface InventoryReportRow {
    sku: string;
    productName: string;
    category: string;
    currentStock: number;
    reorderLevel: number;
    stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
    inventoryValuation: number;
}

// Supplier Purchase Orders
export interface PurchaseOrderRow {
  productName: string;
  sku: string;
  orderedQuantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrderDetails {
  poNumber: string;
  supplierName: string;
  supplierContact: string;
  supplierEmail: string;
  status: 'Pending' | 'Approved' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: PurchaseOrderRow[];
}

// Sales Report Types
export interface SalesReportRow {
  invoiceNumber: string;
  date: string;
  customerName: string;
  cashierName: string;
  paymentMethod: 'Cash' | 'Card' | 'Bank Transfer' | 'Credit';
  totalAmount: number;
}

export interface SalesReportSummary {
  totalTransactions: number;
  totalRevenue: number;
  cashTotal: number;
  cardTotal: number;
}

export interface SalesReportData {
  summary: SalesReportSummary;
  items: SalesReportRow[];
}

// Transaction Invoice / Receipt Types
export interface InvoiceItemRow {
  itemName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface TransactionInvoiceData {
  transactionNumber: string;
  transactionType: 'Sale' | 'Return' | 'Exchange' | 'Quotation' | 'Purchase Order';
  date: string;
  partyName: string; // Customer or Supplier name
  partyContact: string;
  partyAddress?: string;
  items: InvoiceItemRow[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
}

// Customer Report Types
export interface CustomerReportRow {
  customerId: string;
  customerName: string;
  contactNumber: string;
  email: string;
  registrationDate: string;
  totalPurchases: number;
  status: 'Active' | 'Inactive';
}

export interface CustomerReportData {
  summary: {
    totalCustomers: number;
    activeCustomers: number;
    newThisMonth: number;
  };
  items: CustomerReportRow[];
}

// Staff Report Types
export interface StaffReportRow {
  staffId: string;
  staffName: string;
  role: string;
  contactNumber: string;
  email: string;
  registrationDate: string;
  status: 'Active' | 'On Leave' | 'Inactive';
}

export interface StaffReportData {
  summary: {
    totalStaff: number;
    activeStaff: number;
    onLeave: number;
  };
  items: StaffReportRow[];
}

