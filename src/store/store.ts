import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/store/baseApi";
import authReducer from "@/lib/store/authSlice";
import cartReducer from "@/store/slices/cartSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    cart: cartReducer,
  },
  middleware: (getDefault) => getDefault().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
