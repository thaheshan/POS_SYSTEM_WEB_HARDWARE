/* 
 - Added RTK Query endpoints for inventory (list, create, update, delete).
 - Purpose: enable live CRUD for the inventory page and provide hooks the UI uses.
*/

import { baseApi } from "@/store/baseApi";
import { ENDPOINTS } from "@/lib/constants/api";
import type { ApiResponse, Product } from "@/types";

type InventoryPayload = Omit<Product, "id">;

function unwrapResponse<T>(response: ApiResponse<T> | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query<Product[], void>({
      query: () => ENDPOINTS.INVENTORY.BASE,
      transformResponse: (response: ApiResponse<Product[]> | Product[]) =>
        unwrapResponse(response),
      providesTags: (result) =>
        result
          ? [
              { type: "Inventory" as const, id: "LIST" },
              ...result.map((item) => ({
                type: "Inventory" as const,
                id: item.id,
              })),
            ]
          : [{ type: "Inventory" as const, id: "LIST" }],
    }),
    createInventoryItem: builder.mutation<Product, InventoryPayload>({
      query: (body) => ({
        url: ENDPOINTS.INVENTORY.BASE,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Inventory", id: "LIST" }],
    }),
    updateInventoryItem: builder.mutation<
      Product,
      { id: string; data: Partial<InventoryPayload> }
    >({
      query: ({ id, data }) => ({
        url: ENDPOINTS.INVENTORY.BY_ID(id),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [{ type: "Inventory", id: "LIST" }],
    }),
    deleteInventoryItem: builder.mutation<{ success?: boolean }, string>({
      query: (id) => ({
        url: ENDPOINTS.INVENTORY.BY_ID(id),
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Inventory", id: "LIST" }],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
} = inventoryApi;
