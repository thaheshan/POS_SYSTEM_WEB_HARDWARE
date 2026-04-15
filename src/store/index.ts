import { configureStore } from "@reduxjs/toolkit";
import authReducer, {
  loginThunk,
  logout,
  selectUser,
  selectUserRole,
} from "../../lib/store/authSlice";
import cartReducer from "./slices/cartSlice";

export const store = configureStore({
  reducer: {
    // Source of truth auth slice: lib/store/authSlice.ts
    auth: authReducer,
    // Cart state is still managed by local slice under src/store/slices.
    cart: cartReducer,
  },
  // Keep Redux DevTools enabled for easier state debugging.
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export auth thunks and selectors for convenient access
export { loginThunk, logout, selectUser, selectUserRole };
