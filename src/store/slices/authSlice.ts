import axiosInstance from "@/api/axiosInstance";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// Legacy/simple auth slice kept for reference.
// Active store wiring currently points to ../../lib/store/authSlice.

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/login', credentials);
      
      // Unwrap the NestJS response structure (response.data.data)
      const payload = response.data?.data || response.data;

      if (!payload || !payload.user) {
        throw new Error("Invalid login response from server");
      }
      return payload; 

    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data); 
      }
      return rejectWithValue({ message: error.message || "Login failed" });
    }
  }
);


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      // Setting user implies authenticated session in this simplified slice.
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action: PayloadAction<string>) => {
      // Token is stored separately so callers can set it independently.
      state.token = action.payload;
    },
    logout: (state) => {
      // Reset to unauthenticated baseline.
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.access_token;
        
        const backendUser = action.payload.user;
        state.user = {
          id: backendUser.user_id || backendUser.id,
          email: backendUser.email,
          name: `${backendUser.first_name || ''} ${backendUser.last_name || ''}`.trim() || 'Staff Member',
          role: backendUser.role,
        };
      })
      .addCase(loginThunk.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
