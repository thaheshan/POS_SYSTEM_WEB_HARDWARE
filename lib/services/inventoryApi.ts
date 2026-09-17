import { baseApi } from '@/store/baseApi';
import { Inventory } from '@/types';

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getInventoryItems: build.query<Inventory[], void>({
      query: () => '/inventory',
      providesTags: ['Inventory'],
    }),

    getInventoryItemById: build.query<Inventory, string>({
      query: (id) => `/inventory/${id}`,
      providesTags: ['Inventory'],
    }),

    getInventoryItemByBarcode: build.query<Inventory, string>({
      query: (barcode) => `/inventory?barcode=${barcode}`,
      providesTags: ['Inventory'],
    }),

    getInventoryItemsByCategory: build.query<Inventory[], string>({
      query: (categoryId) => `/inventory?categoryId=${categoryId}`,
      providesTags: ['Inventory'],
    }),

    getLowStockInventoryItems: build.query<Inventory[], void>({
      query: () => '/inventory?lowStock=true',
      providesTags: ['Inventory'],
    }),

    createInventoryItem: build.mutation<
      Inventory,
      Omit<Inventory, 'id'>
    >({
      query: (body) => ({
        url: '/inventory',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Inventory'],
    }),

    updateInventoryItem: build.mutation<
      Inventory,
      { id: string } & Partial<Inventory>
    >({
      query: ({ id, ...body }) => ({
        url: `/inventory/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Inventory'],
    }),

    deleteInventoryItem: build.mutation<void, string>({
      query: (id) => ({
        url: `/inventory/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Inventory'],
    }),
  }),
});

export const {
  useGetInventoryItemsQuery,
  useGetInventoryItemByIdQuery,
  useGetInventoryItemByBarcodeQuery,
  useGetInventoryItemsByCategoryQuery,
  useGetLowStockInventoryItemsQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
} = inventoryApi;
