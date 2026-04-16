import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
});

export const { setUser, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
