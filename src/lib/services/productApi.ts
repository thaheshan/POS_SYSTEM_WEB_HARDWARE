import { baseApi, unwrapResponse } from "@/store/baseApi";
import { Product, ApiResponse } from "@/types";

// Centralized Product RTK Query service.
// These endpoints keep product data in sync across the app and use Product cache tags.
export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<Product[], void>({
      query: () => "/inventory",
      transformResponse: (response: ApiResponse<Product[]> | Product[]) =>
        unwrapResponse(response),
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
      transformResponse: (response: ApiResponse<Product> | Product) =>
        unwrapResponse(response),
      providesTags: (result) =>
        result
          ? [{ type: "Product" as const, id: result.sku }]
          : [{ type: "Product" as const, id: "LIST" }],
    }),

    getProductByBarcode: build.query<Product[], string>({
      query: (barcode) => `/inventory?barcode=${encodeURIComponent(barcode)}`,
      transformResponse: (response: ApiResponse<Product[]> | Product[]) =>
        unwrapResponse(response),
      providesTags: [{ type: "Product", id: "LIST" }],
    }),

    getProductsByCategory: build.query<Product[], string>({
      query: (categoryId) =>
        `/inventory?categoryId=${encodeURIComponent(categoryId)}`,
      transformResponse: (response: ApiResponse<Product[]> | Product[]) =>
        unwrapResponse(response),
      providesTags: [{ type: "Product", id: "LIST" }],
    }),

    getLowStockProducts: build.query<Product[], void>({
      query: () => "/inventory?lowStock=true",
      transformResponse: (response: ApiResponse<Product[]> | Product[]) =>
        unwrapResponse(response),
      providesTags: [{ type: "Product", id: "LIST" }],
    }),

    createProduct: build.mutation<Product, Omit<Product, "id">>({
      query: (body) => ({
        url: "/inventory",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Product> | Product) =>
        unwrapResponse(response),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    updateProduct: build.mutation<Product, { sku: string } & Partial<Product>>({
      query: ({ sku, ...body }) => ({
        url: `/inventory/${sku}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<Product> | Product) =>
        unwrapResponse(response),
      invalidatesTags: (result, error, { sku }) => [
        { type: "Product", id: sku },
        { type: "Product", id: "LIST" },
      ],
    }),

    deleteProduct: build.mutation<{ success?: boolean }, string>({
      query: (sku) => ({
        url: `/inventory/${sku}`,
        method: "DELETE",
      }),
      transformResponse: (
        response: ApiResponse<{ success?: boolean }> | { success?: boolean },
      ) => unwrapResponse(response),
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
