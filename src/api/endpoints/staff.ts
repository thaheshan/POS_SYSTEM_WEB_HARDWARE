import api from "../axiosInstance";
import { ENDPOINTS } from "@/lib/constants/api";

export const staffAPI = {
  // Share the route constant so this wrapper stays in sync with the backend.
  getAll: (params?: any) => api.get(ENDPOINTS.STAFF.BASE, { params }),

  getById: (id: string) => api.get(ENDPOINTS.STAFF.BY_ID(id)),

  create: (data: any) => api.post(ENDPOINTS.STAFF.BASE, data),

  // Staff updates are partial, so PATCH is intentional here.
  update: (id: string, data: any) => api.patch(ENDPOINTS.STAFF.BY_ID(id), data),

  delete: (id: string) => api.delete(ENDPOINTS.STAFF.BY_ID(id)),
};
