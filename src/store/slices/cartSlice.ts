import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  customerId: string | null;
  paymentMethod: string;
}

const initialState: CartState = {
  items: [],
  total: 0,
  customerId: null,
  paymentMethod: 'CASH',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ id: string; name: string; price: number }>) => {
      const existing = state.items.find(item => item.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({
          ...action.payload,
          quantity: 1,
        });
      }
      // Re-calculate basic subtotal for legacy state compatibility
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.customerId = null;
      state.paymentMethod = 'CASH';
    },
    setCustomerId: (state, action: PayloadAction<string | null>) => {
      state.customerId = action.payload;
    },
    setPaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethod = action.payload;
    },
  },
});

// selectors for total calculations (Subtotal, NBT (2%), VAT (18% on Subtotal+NBT))
export const selectSubtotal = (state: { cart: CartState }) => 
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const selectNbt = (state: { cart: CartState }) => {
  const subtotal = selectSubtotal(state);
  return Number((subtotal * 0.02).toFixed(2));
};

export const selectVat = (state: { cart: CartState }) => {
  const subtotal = selectSubtotal(state);
  const nbt = selectNbt(state);
  return Number(((subtotal + nbt) * 0.18).toFixed(2));
};

export const selectCartTotal = (state: { cart: CartState }) => {
  const subtotal = selectSubtotal(state);
  const nbt = selectNbt(state);
  const vat = selectVat(state);
  return Number((subtotal + nbt + vat).toFixed(2));
};

export const { addItem, removeItem, clearCart, setCustomerId, setPaymentMethod } = cartSlice.actions;
export default cartSlice.reducer;
