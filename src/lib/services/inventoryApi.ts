import { baseApi } from "@/store/baseApi";
import { AdjustStockPayload, InventoryItem, PaginatedResponse } from "@/types/inventory";


export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    
    getInventory: build.query<InventoryItem[], void>({
      query: () => "/stock",
      transformResponse: (response: { success: boolean; data: InventoryItem[] }) => response.data,
      providesTags: ["Inventory"],
    }),

    adjustStock: build.mutation<void, AdjustStockPayload>({
      query: ({ action, ...body }) => ({
        url: `/stock/${action}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Inventory"],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetInventoryQuery,
  useAdjustStockMutation,
} = inventoryApi;