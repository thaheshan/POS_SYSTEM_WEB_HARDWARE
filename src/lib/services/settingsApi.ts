import { baseApi } from "@/store/baseApi";
import { Category, StoreSettings } from "../../../types";

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSettings: build.query<StoreSettings, void>({
      query: () => "/shop/profile",
      providesTags: ["Settings"],
      transformResponse: (response: any) => {
        const shop = response?.data || response;
        return {
          shopName: shop?.name || "",
          businessRegistration: shop?.business_registration_no || "",
          businessPhone: shop?.phone || "",
          businessEmail: shop?.email || "",
          shopAddress: shop?.address || "",
          city: shop?.city || "",
          district: shop?.district || "",
          province: shop?.province || "",
          logoUrl: shop?.logo_url || null,
        } as StoreSettings;
      },
    }),

    updateSettings: build.mutation<any, Partial<StoreSettings>>({
      query: (body) => {
        const apiBody: any = {};
        if (body.shopName !== undefined) apiBody.name = body.shopName;
        if (body.businessRegistration !== undefined) apiBody.business_registration_no = body.businessRegistration;
        if (body.businessPhone !== undefined) apiBody.phone = body.businessPhone;
        if (body.businessEmail !== undefined) apiBody.email = body.businessEmail;
        if (body.shopAddress !== undefined) apiBody.address = body.shopAddress;
        if (body.city !== undefined) apiBody.city = body.city;
        if (body.district !== undefined) apiBody.district = body.district;
        if (body.province !== undefined) apiBody.province = body.province;

        return {
          url: "/shop/profile",
          method: "PUT",
          body: apiBody,
        };
      },
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
