import { baseApi } from "@/store/baseApi";
import { Category, StoreSettings } from "../../../types";

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSettings: build.query<StoreSettings, void>({
      query: () => "/settings",
      providesTags: ["Settings"],
    }),

    updateSettings: build.mutation<StoreSettings, Partial<StoreSettings>>({
      query: (body) => ({
        url: "/settings",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),

    getCategories: build.query<Category[], void>({
      query: () => "products/categories",
      providesTags: ["Category"],
      transformResponse: (response: any) => response.data || response,
    }),

    createCategory: build.mutation<Category, { name: string; description?: string }>({
      query: (body) => ({
        url: "/products/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: build.mutation<Category, { id: string; name: string; description?: string }>({
      query: ({ id, ...body }) => ({
        url: `/products/categories/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: build.mutation<void, string>({
      query: (id) => ({
        url: `/products/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = settingsApi;
