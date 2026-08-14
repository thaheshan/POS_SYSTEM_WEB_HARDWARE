import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  img?: string;
  sku?: string;
  warehouseId?: string;
}

interface CartState {
  items: CartItem[];
  selectedCustomer: { id: string; name: string; phone: string } | null;
  paymentMethod: 'CASH' | 'CARD' | 'CREDIT';
}

const initialState: CartState = {
  items: [],
  selectedCustomer: null,
  paymentMethod: 'CASH',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) {
        existing.qty += action.payload.qty || 1;
      } else {
        state.items.push({ ...action.payload, qty: action.payload.qty || 1 });
      }
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; qty: number }>) => {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) {
        if (action.payload.qty <= 0) {
          state.items = state.items.filter(i => i.id !== action.payload.id);
        } else {
          item.qty = action.payload.qty;
        }
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    setSelectedCustomer: (state, action: PayloadAction<{ id: string; name: string; phone: string } | null>) => {
      state.selectedCustomer = action.payload;
    },
    setPaymentMethod: (state, action: PayloadAction<'CASH' | 'CARD' | 'CREDIT'>) => {
      state.paymentMethod = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.selectedCustomer = null;
      state.paymentMethod = 'CASH';
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  setSelectedCustomer,
  setPaymentMethod,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
