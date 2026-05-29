import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/store/baseApi";
import authReducer from "../../lib/store/authSlice";
import cartReducer from "@/store/slices/cartSlice";
import customersReducer from "@/store/slices/customersSlice";
import inventoryReducer from "@/store/slices/inventorySlice";
import ordersReducer from "@/store/slices/ordersSlice";
import productsReducer from "@/store/slices/productsSlice";
import salesReducer from "@/store/slices/salesSlice";
import staffReducer from "@/store/slices/staffSlice";
import suppliersReducer from "@/store/slices/suppliersSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    cart: cartReducer,
    customers: customersReducer,
    inventory: inventoryReducer,
    orders: ordersReducer,
    products: productsReducer,
    sales: salesReducer,
    staff: staffReducer,
    suppliers: suppliersReducer,
  },
  middleware: (getDefault) => getDefault().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
