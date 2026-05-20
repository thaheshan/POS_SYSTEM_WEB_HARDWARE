import { baseApi } from "@/store/baseApi";
import { Product } from "@/types";

// Centralized Product/Inventory RTK Query service.
// These endpoints keep product data in sync across the app and reuse the shared Product cache tag.
export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<Product[], void>({
      query: () => "/inventory",
      providesTags: ["Product"],
    }),

    getProductById: build.query<Product, string>({
      query: (id) => `/inventory/${id}`,
      providesTags: (result) =>
        result ? [{ type: "Product" as const, id: result.id }] : ["Product"],
    }),

    getProductByBarcode: build.query<Product[], string>({
      query: (barcode) => `/inventory?barcode=${encodeURIComponent(barcode)}`,
      providesTags: ["Product"],
    }),

    getProductsByCategory: build.query<Product[], string>({
      query: (categoryId) =>
        `/inventory?categoryId=${encodeURIComponent(categoryId)}`,
      providesTags: ["Product"],
    }),

    getLowStockProducts: build.query<Product[], void>({
      query: () => "/inventory?lowStock=true",
      providesTags: ["Product"],
    }),

    createProduct: build.mutation<Product, Omit<Product, "id">>({
      query: (body) => ({
        url: "/inventory",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    updateProduct: build.mutation<Product, { id: string } & Partial<Product>>({
      query: ({ id, ...body }) => ({
        url: `/inventory/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    deleteProduct: build.mutation<void, string>({
      query: (id) => ({
        url: `/inventory/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
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
