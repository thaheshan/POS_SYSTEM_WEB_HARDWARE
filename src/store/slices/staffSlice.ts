import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { staffAPI } from "@/api/endpoints/staff";
import { StaffMemberResponse, StaffRegistrationPayload } from "@/types/staff";

export interface StaffStatusResponse {
  is_active?: boolean;
  is_verified?: boolean;
  status?: string;
}

export type StaffApprovalDecision =
  | "approved"
  | "pending"
  | "rejected"
  | "unknown";

const normalizeStatus = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toUpperCase();

const resolveDecisionFromPayload = (
  payload?: Partial<StaffStatusResponse> | null
): StaffApprovalDecision => {
  if (!payload) return "unknown";

  const statusStr = normalizeStatus(payload.status);
  const isApproved = payload.is_active === true && payload.is_verified === true;

  if (isApproved || statusStr === "APPROVED" || statusStr === "ACTIVE") {
    return "approved";
  }

  if (statusStr === "PENDING" || statusStr === "PENDING_APPROVAL") {
    return "pending";
  }

  if (statusStr === "REJECTED" || statusStr === "DECLINED") {
    return "rejected";
  }

  return "unknown";
};

export const resolveStaffApprovalDecision = (
  payload?: Partial<StaffStatusResponse> | null
): StaffApprovalDecision => resolveDecisionFromPayload(payload);

export const resolveStaffApprovalDecisionFromError = (
  error?: { status?: number; data?: any } | null
): StaffApprovalDecision => {
  const decision = resolveDecisionFromPayload(
    error?.data as Partial<StaffStatusResponse> | null | undefined
  );

  if (decision !== "unknown") return decision;

  const message = normalizeStatus(error?.data?.message);
  if (message.includes("PENDING")) return "pending";
  if (message.includes("REJECT")) return "rejected";

  return error?.status === 403 ? "pending" : "unknown";
};

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
        state.approvalStatus =
          resolveStaffApprovalDecision(payload) === "rejected"
            ? "rejected"
            : resolveStaffApprovalDecision(payload) === "approved"
            ? "approved"
            : "pending";
      })
      .addCase(checkStaffStatus.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;

        const err = action.payload as
          | { status?: number; data?: any }
          | undefined;

        const decision = resolveStaffApprovalDecisionFromError(err);

        if (decision === "approved") {
          state.approvalStatus = "approved";
          state.error = null;
          return;
        }

        if (decision === "pending" || err?.status === 403) {
          state.approvalStatus = "pending";
          state.error = err?.data?.message || "Approval still pending";
          return;
        }

        if (decision === "rejected") {
          state.approvalStatus = "rejected";
          state.error = err?.data?.message || "Access denied";
          return;
        }

        state.error =
          err?.data?.message ||
          action.error.message ||
          "Failed to check staff status";
      });
  },
});

export const { setStaff } = staffSlice.actions;
export default staffSlice.reducer;
