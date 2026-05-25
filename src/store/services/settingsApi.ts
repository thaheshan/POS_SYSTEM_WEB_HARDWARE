/* 
 - Adds `useGetCategoriesQuery` to fetch product categories from the settings API.
 - Used by the inventory form's category select; the UI falls back to mock data if this returns empty.
*/

import { baseApi } from "@/store/baseApi";
import { ENDPOINTS } from "@/lib/constants/api";
import type { ApiResponse } from "@/types";
import type { ProductCategory } from "@/types/product";

function unwrapResponse<T>(response: ApiResponse<T> | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ProductCategory[], void>({
      query: () => `${ENDPOINTS.SETTINGS.BASE}/categories`,
      transformResponse: (
        response: ApiResponse<ProductCategory[]> | ProductCategory[],
      ) => unwrapResponse(response),
      providesTags: [{ type: "Settings", id: "CATEGORIES" }],
    }),
  }),
});

export const { useGetCategoriesQuery } = settingsApi;
