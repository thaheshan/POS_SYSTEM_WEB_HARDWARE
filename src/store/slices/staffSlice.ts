import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { staffAPI } from "@/api/endpoints/staff";
import { StaffMemberResponse, StaffRegistrationPayload } from "@/types/staff";

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
>("staff/register", async (payload, { rejectWithValue }) => {
  try {
    const response = await staffAPI.register(payload);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data || { message: "Failed to register staff member" }
    );
  }
});

export interface StaffStatusResponse {
  is_active?: boolean;
  is_verified?: boolean;
  status?: string;
}

export const checkStaffStatus = createAsyncThunk<
  StaffStatusResponse,
  string,
  { rejectValue: { status?: number; data?: any } }
>("staff/checkStatus", async (staffId: string, { rejectWithValue }) => {
  try {
    const res = await staffAPI.status(staffId);
    return res.data as StaffStatusResponse;
  } catch (error: any) {
    return rejectWithValue({
      status: error.response?.status,
      data: error.response?.data,
    });
  }
});

interface StaffState {
  items: any[];
  status: "idle" | "loading" | "succeeded" | "failed";
  approvalStatus: "unknown" | "approved" | "pending" | "rejected";
  loading: boolean;
  details: StaffStatusResponse | null;
  error: string | null;
}

const initialState: StaffState = {
  items: [],
  status: "idle",
  approvalStatus: "unknown",
  loading: false,
  details: null,
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
        state.loading = true;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.error.message || "Failed to fetch staff";
      })
      .addCase(checkStaffStatus.pending, (state) => {
        state.status = "loading";
        state.loading = true;
      })
      .addCase(checkStaffStatus.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.loading = false;
        state.details = payload;

        const statusStr = (payload.status ?? "").toString().toUpperCase();

        if (payload.is_active === true && payload.is_verified === true) {
          state.approvalStatus = "approved";
        } else if (statusStr === "REJECTED") {
          state.approvalStatus = "rejected";
        } else if (statusStr === "APPROVED") {
          state.approvalStatus = "approved";
        } else {
          state.approvalStatus = "pending";
        }
      })
      .addCase(checkStaffStatus.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;

        const err = action.payload as
          | { status?: number; data?: any }
          | undefined;

        if (err?.status === 403) {
          state.approvalStatus = "rejected";
          state.error = err.data?.message || "Access denied";
        } else {
          state.error =
            err?.data?.message ||
            action.error.message ||
            "Failed to check staff status";
        }
      });
  },
});

export const { setStaff } = staffSlice.actions;
export default staffSlice.reducer;
