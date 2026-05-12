import { baseApi } from "@/store/baseApi";
import type { Staff } from "@/types";

export const staffApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStaff: build.query<Staff[], void>({
      query: () => ({ url: "/staff", method: "GET" }),
      providesTags: ["Staff"],
    }),

    getStaffByRole: build.query<Staff[], string>({
      query: (role) => ({ url: `/staff?role=${role}`, method: "GET" }),
      providesTags: ["Staff"],
    }),

    getStaffById: build.query<Staff, string>({
      query: (id) => ({ url: `/staff/${id}`, method: "GET" }),
      providesTags: ["Staff"],
    }),

    getCashiers: build.query<Staff[], void>({
      query: () => ({ url: "/staff?role=cashier", method: "GET" }),
      providesTags: ["Staff"],
    }),

    createStaff: build.mutation<
      Staff,
      Omit<Staff, "id"> & { password: string }
    >({
      query: (body) => ({ url: "/staff", method: "POST", body }),
      invalidatesTags: ["Staff"],
    }),

    updateStaff: build.mutation<Staff, { id: string } & Partial<Staff>>({
      query: ({ id, ...body }) => ({
        url: `/staff/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Staff"],
    }),

    deleteStaff: build.mutation<void, string>({
      query: (id) => ({ url: `/staff/${id}`, method: "DELETE" }),
      invalidatesTags: ["Staff"],
    }),

    resetPassword: build.mutation<void, { id: string; newPassword: string }>({
      query: ({ id, newPassword }) => ({
        url: `/staff/${id}/password`,
        method: "PATCH",
        body: { newPassword },
      }),
      invalidatesTags: ["Staff"],
    }),
  }),
});

export const {
  useGetStaffQuery,
  useGetStaffByRoleQuery,
  useGetStaffByIdQuery,
  useGetCashiersQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useResetPasswordMutation,
} = staffApi;

export default staffApi;
