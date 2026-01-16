export const APP_NAME = 'Hardware POS System';
export const APP_VERSION = '1.0.0';

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'credit', label: 'Credit' },
] as const;

export const USER_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'cashier', label: 'Cashier' },
] as const;

export const PRODUCT_UNITS = [
  'pc', 'kg', 'g', 'l', 'ml', 'box', 'pack', 'm', 'ft'
] as const;

export const TAX_RATE = 0.18; // 18% GST
