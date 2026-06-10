import { baseApi } from '@/store/baseApi';
import { StaffManagement } from '@/types';

export const staffManagementApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStaffManagement: build.query<StaffManagement[], void>({
      query: () => '/staff-management',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Staff' as const, id })),
              { type: 'Staff', id: 'LIST' },
            ]
          : [{ type: 'Staff', id: 'LIST' }],
    }),

    getStaffManagementById: build.query<StaffManagement, string>({
      query: (id) => `/staff-management/${id}`,
      providesTags: (result, error, id) => [{ type: 'Staff', id }],
    }),

    getCashiers: build.query<StaffManagement[], void>({
      query: () => '/staff-management?role=cashier',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Staff' as const, id })),
              { type: 'Staff', id: 'LIST' },
            ]
          : [{ type: 'Staff', id: 'LIST' }],
    }),

    createStaffManagement: build.mutation<
      StaffManagement,
      Omit<StaffManagement, 'id'> & { password: string }
    >({
      query: (body) => ({
        url: '/staff-management',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Staff', id: 'LIST' }],
    }),

    updateStaffManagement: build.mutation<
      StaffManagement,
      { id: string } & Partial<StaffManagement>
    >({
      query: ({ id, ...body }) => ({
        url: `/staff-management/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Staff', id },
        { type: 'Staff', id: 'LIST' },
      ],
    }),

    deleteStaffManagement: build.mutation<void, string>({
      query: (id) => ({
        url: `/staff-management/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Staff', id },
        { type: 'Staff', id: 'LIST' },
      ],
    }),

    resetPassword: build.mutation<
      void,
      { id: string; newPassword: string }
    >({
      query: ({ id, newPassword }) => ({
        url: `/staff-management/${id}/password`,
        method: 'PATCH',
        body: { newPassword },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Staff', id }],
    }),
  }),
});

export const {
  useGetStaffManagementQuery,
  useGetStaffManagementByIdQuery,
  useGetCashiersQuery,
  useCreateStaffManagementMutation,
  useUpdateStaffManagementMutation,
  useDeleteStaffManagementMutation,
  useResetPasswordMutation,
} = staffManagementApi;
