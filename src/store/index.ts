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
import { baseApi } from "./baseApi";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
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
  middleware: (getDefault) => getDefault().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;