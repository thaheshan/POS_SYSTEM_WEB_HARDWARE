import { baseApi } from "@/store/baseApi";
import { Product } from "@/types";

// Centralized Product RTK Query service.
// These endpoints keep product data in sync across the app and use Product cache tags.
export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<Product[], void>({
      query: () => "/inventory",
      providesTags: (result) =>
        result
          ? [
              { type: "Product" as const, id: "LIST" },
              ...result.map(({ sku }) => ({
                type: "Product" as const,
                id: sku,
              })),
            ]
          : [{ type: "Product" as const, id: "LIST" }],
    }),

    getProductById: build.query<Product, string>({
      query: (sku) => `/inventory/${sku}`,
      providesTags: (result) =>
        result
          ? [{ type: "Product" as const, id: result.sku }]
          : [{ type: "Product" as const, id: "LIST" }],
    }),

    getProductByBarcode: build.query<Product[], string>({
      query: (barcode) => `/inventory?barcode=${encodeURIComponent(barcode)}`,
      providesTags: [{ type: "Product", id: "LIST" }],
    }),

    getProductsByCategory: build.query<Product[], string>({
      query: (categoryId) =>
        `/inventory?categoryId=${encodeURIComponent(categoryId)}`,
      providesTags: [{ type: "Product", id: "LIST" }],
    }),

    getLowStockProducts: build.query<Product[], void>({
      query: () => "/inventory?lowStock=true",
      providesTags: [{ type: "Product", id: "LIST" }],
    }),

    createProduct: build.mutation<Product, Omit<Product, "id">>({
      query: (body) => ({
        url: "/inventory",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    updateProduct: build.mutation<Product, { sku: string } & Partial<Product>>({
      query: ({ sku, ...body }) => ({
        url: `/inventory/${sku}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { sku }) => [
        { type: "Product", id: sku },
        { type: "Product", id: "LIST" },
      ],
    }),

    deleteProduct: build.mutation<void, string>({
      query: (sku) => ({
        url: `/inventory/${sku}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, sku) => [
        { type: "Product", id: sku },
        { type: "Product", id: "LIST" },
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
