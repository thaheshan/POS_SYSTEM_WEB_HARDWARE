import { baseApi } from '@/store/baseApi';
import { StaffManagement } from '@/types';

const unpackResponse = <T>(response: any): T => {
  if (response && typeof response === 'object') {
    if (Array.isArray(response.data?.data)) return response.data.data as T;
    if (Array.isArray(response.data)) return response.data as T;
    if (Array.isArray(response)) return response as T;
    if (response.data?.data) return response.data.data as T;
    if (response.data) return response.data as T;
  }
  return response as T;
};

export const staffManagementApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStaffManagement: build.query<StaffManagement[], void>({
      query: () => '/staff-management',
      transformResponse: (response: any) => unpackResponse<StaffManagement[]>(response),
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
      transformResponse: (response: any) => unpackResponse<StaffManagement>(response),
      providesTags: (result, error, id) => [{ type: 'Staff', id }],
    }),

    getCashiers: build.query<StaffManagement[], void>({
      query: () => '/staff-management?role=cashier',
      transformResponse: (response: any) => unpackResponse<StaffManagement[]>(response),
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
      transformResponse: (response: any) => unpackResponse<StaffManagement>(response),
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
      transformResponse: (response: any) => unpackResponse<StaffManagement>(response),
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

    getPendingStaff: build.query<any[], void>({
      query: () => '/staff/pending',
      transformResponse: (response: any) => unpackResponse<any[]>(response),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Staff' as const, id })),
              { type: 'Staff', id: 'PENDING_LIST' },
            ]
          : [{ type: 'Staff', id: 'PENDING_LIST' }],
    }),

    approveStaff: build.mutation<any, { staffId: string; action: 'approve' | 'reject' }>({
      query: ({ staffId, action }) => ({
        url: '/staff/approve',
        method: 'POST',
        body: { staff_id: staffId, action },
      }),
      transformResponse: (response: any) => unpackResponse<any>(response),
      invalidatesTags: [
        { type: 'Staff', id: 'LIST' },
        { type: 'Staff', id: 'PENDING_LIST' },
      ],
    }),

    getRoles: build.query<any[], void>({
      query: () => '/roles',
      transformResponse: (response: any) => unpackResponse<any[]>(response),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Staff' as const, id })),
              { type: 'Staff', id: 'ROLES_LIST' },
            ]
          : [{ type: 'Staff', id: 'ROLES_LIST' }],
    }),

    createRole: build.mutation<any, { name: string; description?: string; permissions?: string[] }>({
      query: (body) => ({
        url: '/roles',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => unpackResponse<any>(response),
      invalidatesTags: [{ type: 'Staff', id: 'ROLES_LIST' }],
    }),

    deleteRole: build.mutation<void, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Staff', id: 'ROLES_LIST' }],
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
  useGetPendingStaffQuery,
  useApproveStaffMutation,
  useGetRolesQuery,
  useCreateRoleMutation,
  useDeleteRoleMutation,
} = staffManagementApi;
