import { baseApi } from "@/store/baseApi";
import { InventoryItem } from "../../../types";
import { AdjustStockPayload, PaginatedResponse } from "@/types/inventory";


export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    
    getInventory: build.query<InventoryItem[], void>({
      query: () => "/stock",
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