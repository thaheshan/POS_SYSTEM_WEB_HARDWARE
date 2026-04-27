import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { customersAPI } from '../../api/endpoints/customers';

export const fetchCustomers = createAsyncThunk(
  'customers/fetchAll',
  async (params?: any) => {
    const response = await customersAPI.getAll(params);
    return response.data;
  }
);

interface CustomersState {
  items: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CustomersState = {
  items: [],
  status: 'idle',
  error: null,
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomers: (state, action: PayloadAction<any[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch customers';
      });
  },
});

export const { setCustomers } = customersSlice.actions;
export default customersSlice.reducer;
