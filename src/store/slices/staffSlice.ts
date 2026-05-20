import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { staffAPI } from "../../api/endpoints/staff";
import { StaffMemberResponse, StaffRegistrationPayload } from "@/types/staff";
import axios from "axios";

export const fetchStaff = createAsyncThunk(
  "staff/fetchAll",
  async (params?: any) => {
    const response = await staffAPI.getAll(params);
    return response.data;
  }
);

export const registerStaff = createAsyncThunk<
  StaffMemberResponse,
  StaffRegistrationPayload
>(
  "staff/register",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await staffAPI.register(payload);
      return response.data;


    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to register');
    }
  }
);

interface StaffState {
  items: any[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: StaffState = {
  items: [],
  status: "idle",
  error: null,
};

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    setStaff: (state, action: PayloadAction<any[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaff.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch staff";
      });
  },
});

export const { setStaff } = staffSlice.actions;
export default staffSlice.reducer;
