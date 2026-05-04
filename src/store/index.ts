import { configureStore } from "@reduxjs/toolkit";
import authReducer, {
  loginThunk,
  logout,
  selectUser,
  selectUserRole,
} from "../../lib/store/authSlice";
import cartReducer from "./slices/cartSlice";
import productsReducer from "./slices/productsSlice";
import customersReducer from "./slices/customersSlice";
import suppliersReducer from "./slices/suppliersSlice";
import inventoryReducer from "./slices/inventorySlice";
import ordersReducer from "./slices/ordersSlice";
import staffReducer from "./slices/staffSlice";
import salesReducer from "./slices/salesSlice";
import forgotPasswordReducer from "./slices/forgotPasswordSlice";

export const store = configureStore({
  reducer: {
    // Source of truth auth slice: lib/store/authSlice.ts
    auth: authReducer,
    // Cart state is still managed by local slice under src/store/slices.
    cart: cartReducer,
    products: productsReducer,
    customers: customersReducer,
    suppliers: suppliersReducer,
    inventory: inventoryReducer,
    orders: ordersReducer,
    staff: staffReducer,
    sales: salesReducer,
    forgotPassword: forgotPasswordReducer,
  },
  // Keep Redux DevTools enabled for easier state debugging.
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export auth thunks and selectors for convenient access
export { loginThunk, logout, selectUser, selectUserRole };
