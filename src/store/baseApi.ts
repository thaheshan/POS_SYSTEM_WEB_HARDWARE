import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/store';
import { BASE_URL, TOKEN_KEY } from '@/lib/constants/api';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token =
      (getState() as RootState).auth?.token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem(TOKEN_KEY)
        : null);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth: typeof rawBaseQuery = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    console.warn('[RTK Query] 401 Unauthorized on endpoint:', args);
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Product',
    'Inventory',
    'Sale',
    'Customer',
    'Supplier',
    'Order',
    'Staff',
    'Settings',
  ],
  endpoints: () => ({}),
});
