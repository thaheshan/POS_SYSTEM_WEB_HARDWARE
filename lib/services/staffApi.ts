import { baseApi } from "@/store/baseApi";
import { Staff } from "@/types";

export const staffApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStaff: build.query<Staff[], void>({
      // The staff collection is exposed through the staff-management route.
      query: () => "/staff-management",
      providesTags: [{ type: "Staff" as const, id: "LIST" }],
    }),

    getStaffById: build.query<Staff, string>({
      // Keep staff lookups aligned with the canonical backend resource path.
      query: (id) => `/staff-management/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Staff" as const, id }],
    }),

    getStaffByRole: build.query<Staff[], string>({
      // Role filtering is passed via params instead of string interpolation.
      query: (role) => ({
        url: "/staff-management",
        params: { role },
      }),
      providesTags: [{ type: "Staff" as const, id: "LIST" }],
    }),

    createStaff: build.mutation<
      Staff,
      Omit<Staff, "id"> & { password: string }
    >({
      // Creation uses the same collection endpoint as the list query.
      query: (body) => ({
        url: "/staff-management",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Staff" as const, id: "LIST" }],
    }),

    updateStaff: build.mutation<Staff, { id: string } & Partial<Staff>>({
      // PATCH matches the partial-update contract for staff edits.
      query: ({ id, ...body }) => ({
        url: `/staff-management/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Staff" as const, id },
        { type: "Staff" as const, id: "LIST" },
      ],
    }),

    deleteStaff: build.mutation<void, string>({
      // Deletions stay on the canonical staff-management resource path.
      query: (id) => ({
        url: `/staff-management/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Staff" as const, id },
        { type: "Staff" as const, id: "LIST" },
      ],
    }),

    resetPassword: build.mutation<void, { id: string; newPassword: string }>({
      query: ({ id, newPassword }) => ({
        url: `/staff-management/${id}/password`,
        method: "PATCH",
        body: { newPassword },
      }),
    }),
  }),
});

export const {
  useGetStaffQuery,
  useGetStaffByIdQuery,
  useGetStaffByRoleQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useResetPasswordMutation,
} = staffApi;

export default staffApi;
