import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ordersAPI } from '../../api/endpoints/orders';

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (params?: any) => {
    const response = await ordersAPI.getAll(params);
    return response.data;
  }
);

interface OrdersState {
  items: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  status: 'idle',
  error: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<any[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch orders';
      });
  },
});

export const { setOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
