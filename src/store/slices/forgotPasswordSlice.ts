import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { authAPI } from "@/api/endpoints/auth";

export interface ForgotPasswordState {
  loading: boolean;
  resetRequested: boolean;
  verified: boolean;
  error: string;
  email: string;
  resetToken: string | null;
}

interface ForgotPasswordRequestPayload {
  email: string;
}

interface ForgotPasswordResetPayload {
  email?: string;
  resetToken?: string;
  newPassword: string;
}

interface ForgotPasswordResponse {
  message: string;
  email: string;
  resetToken: string | null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialState: ForgotPasswordState = {
  loading: false,
  resetRequested: false,
  verified: false,
  error: "",
  email: "",
  resetToken: null,
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const genericRequestMessage =
  "If the account exists, reset instructions have been sent.";

const extractErrorMessage = (error: unknown, fallback: string) => {
  // Normalize axios/server error payloads into a simple UI message.
  if (error && typeof error === "object" && "response" in error) {
    const response = error as {
      response?: { data?: { message?: string; error?: string } };
    };
    const message =
      response.response?.data?.message ?? response.response?.data?.error;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

export const requestPasswordReset = createAsyncThunk<
  ForgotPasswordResponse,
  ForgotPasswordRequestPayload,
  { rejectValue: string }
>("forgotPassword/request", async ({ email }, { rejectWithValue }) => {
  const normalizedEmail = normalizeEmail(email);

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return rejectWithValue("Enter a valid email address.");
  }

  try {
    // Backend is responsible for generating token and dispatching email.
    await authAPI.forgotPassword(normalizedEmail);

    return {
      message: genericRequestMessage,
      email: normalizedEmail,
      resetToken: null,
    };
  } catch (error) {
    return rejectWithValue(
      extractErrorMessage(error, "Unable to request a password reset."),
    );
  }
});

export const resetPassword = createAsyncThunk<
  { message: string },
  ForgotPasswordResetPayload,
  { rejectValue: string }
>("forgotPassword/reset", async (payload, { rejectWithValue }) => {
  const normalizedEmail = payload.email ? normalizeEmail(payload.email) : "";
  const trimmedToken = payload.resetToken?.trim() ?? "";

  if (!payload.newPassword.trim()) {
    return rejectWithValue("Enter a new password.");
  }

  try {
    // Token comes from the reset-link query param captured by the page.
    await authAPI.resetPassword({
      email: normalizedEmail || undefined,
      token: trimmedToken || undefined,
      newPassword: payload.newPassword,
    });

    return { message: "Password updated successfully." };
  } catch (error) {
    return rejectWithValue(
      extractErrorMessage(error, "The reset token is invalid or expired."),
    );
  }
});

const forgotPasswordSlice = createSlice({
  name: "forgotPassword",
  initialState,
  reducers: {
    clearForgotPasswordFlow: (state) => {
      // Resets transient flow state when entering/leaving forgot-password pages.
      state.loading = false;
      state.resetRequested = false;
      state.verified = false;
      state.error = "";
      state.email = "";
      state.resetToken = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        // UI moves to "check your email" after this flag flips.
        state.loading = false;
        state.resetRequested = true;
        state.verified = false;
        state.error = "";
        state.email = action.payload.email;
        state.resetToken = action.payload.resetToken;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Unable to request a password reset.";
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(resetPassword.fulfilled, (state) => {
        // Mark flow as verified once reset completes successfully.
        state.loading = false;
        state.verified = true;
        state.error = "";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error.message ??
          "The reset token is invalid or expired.";
      });
  },
});

export const { clearForgotPasswordFlow } = forgotPasswordSlice.actions;

export const selectForgotPassword = (state: RootState) => state.forgotPassword;

export default forgotPasswordSlice.reducer;
