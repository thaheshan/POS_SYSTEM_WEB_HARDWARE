import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { salesAPI } from '../../api/endpoints/sales';

export const fetchSales = createAsyncThunk(
  'sales/fetchAll',
  async (params?: any) => {
    const response = await salesAPI.getAll(params);
    return response.data;
  }
);

interface SalesState {
  items: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SalesState = {
  items: [],
  status: 'idle',
  error: null,
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setSales: (state, action: PayloadAction<any[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSales.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch sales';
      });
  },
});

export const { setSales } = salesSlice.actions;
export default salesSlice.reducer;
