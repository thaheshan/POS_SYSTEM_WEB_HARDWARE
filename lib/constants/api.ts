// lib/constants/api.ts

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

export const TOKEN_KEY = "pos_token";

export const TAX_RATES = {
  VAT: 0.18,
  NBT: 0.02,
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
  },

  PRODUCTS: {
    BASE: "/products",
    BY_ID: (id: string) => `/products/${id}`,
  },

  INVENTORY: {
    BASE: "/inventory",
    BY_ID: (id: string) => `/inventory/${id}`,
    STOCK: (id: string) => `/inventory/${id}/stock`,
  },

  SALES: {
    BASE: "/sales",
    BY_ID: (id: string) => `/sales/${id}`,
  },

  CUSTOMERS: {
    BASE: "/customers",
    BY_ID: (id: string) => `/customers/${id}`,
  },

  SUPPLIERS: {
    BASE: "/suppliers",
    BY_ID: (id: string) => `/suppliers/${id}`,
  },

  ORDERS: {
    BASE: "/orders",
    BY_ID: (id: string) => `/orders/${id}`,
  },

  STAFF: {
    BASE: "/staff",
    BY_ID: (id: string) => `/staff/${id}`,
  },

  REPORTS: {
    SALES: "/reports/sales",
    INVENTORY: "/reports/inventory",
    TAX: "/reports/tax",
  },

  SETTINGS: {
    BASE: "/settings",
  },
};
