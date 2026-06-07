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
      query: () => "/categories",
      providesTags: ["Category"],
    }),

    createCategory: build.mutation<Category, Omit<Category, "id">>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: build.mutation<
      Category,
      { id: string } & Partial<Category>
    >({
      query: ({ id, ...body }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: build.mutation<void, string>({
      query: (id) => ({
        url: `/categories/${id}`,
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
