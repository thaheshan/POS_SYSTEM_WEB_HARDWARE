import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { suppliersAPI } from '../../api/endpoints/suppliers';

export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchAll',
  async (params?: any) => {
    const response = await suppliersAPI.getAll(params);
    return response.data;
  }
);

interface SuppliersState {
  items: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SuppliersState = {
  items: [],
  status: 'idle',
  error: null,
};

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    setSuppliers: (state, action: PayloadAction<any[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch suppliers';
      });
  },
});

export const { setSuppliers } = suppliersSlice.actions;
export default suppliersSlice.reducer;
