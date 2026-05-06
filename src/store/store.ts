import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './baseApi';
import authReducer from '../../lib/store/authSlice'; // Maintaining existing path for now
import cartReducer from './slices/cartSlice';

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
