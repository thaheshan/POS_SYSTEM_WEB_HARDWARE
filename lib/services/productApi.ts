import { baseApi } from "@/store/baseApi";
import { Product } from "@/types";

// Centralized Product/Inventory RTK Query service.
// These endpoints keep product data in sync across the app and reuse the shared Product cache tag.
export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<Product[], void>({
      query: () => "/inventory",
      providesTags: (result) =>
        result
          ? [
              { type: "Inventory" as const, id: "LIST" },
              ...result.map(({ id }) => ({ type: "Inventory" as const, id })),
            ]
          : [{ type: "Inventory" as const, id: "LIST" }],
    }),

    getProductById: build.query<Product, string>({
      query: (id) => `/inventory/${id}`,
      providesTags: (result) =>
        result
          ? [{ type: "Inventory" as const, id: result.id }]
          : [{ type: "Inventory" as const, id: "LIST" }],
    }),

    getProductByBarcode: build.query<Product[], string>({
      query: (barcode) => `/inventory?barcode=${encodeURIComponent(barcode)}`,
      providesTags: [{ type: "Inventory" as const, id: "LIST" }],
    }),

    getProductsByCategory: build.query<Product[], string>({
      query: (categoryId) =>
        `/inventory?categoryId=${encodeURIComponent(categoryId)}`,
      providesTags: [{ type: "Inventory" as const, id: "LIST" }],
    }),

    getLowStockProducts: build.query<Product[], void>({
      query: () => "/inventory?lowStock=true",
      providesTags: [{ type: "Inventory" as const, id: "LIST" }],
    }),

    createProduct: build.mutation<Product, Omit<Product, "id">>({
      query: (body) => ({
        url: "/inventory",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Inventory", id: "LIST" }],
    }),

    updateProduct: build.mutation<Product, { id: string } & Partial<Product>>({
      query: ({ id, ...body }) => ({
        url: `/inventory/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Inventory", id },
        { type: "Inventory", id: "LIST" },
      ],
    }),

    deleteProduct: build.mutation<void, string>({
      query: (id) => ({
        url: `/inventory/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Inventory", id },
        { type: "Inventory", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductByBarcodeQuery,
  useGetProductsByCategoryQuery,
  useGetLowStockProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
