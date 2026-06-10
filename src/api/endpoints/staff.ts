import { Staff } from '@/types';
import api from '../axiosInstance';

/**
 * @deprecated Legacy axios wrapper for staff endpoints.
 * Please use RTK Query hooks from `lib/services/staffManagementApi` where possible.
 */
export const staffAPI = {
  getAll: (params?: any) =>
    api.get('/staff', { params }),
  
  getById: (id: string) =>
    api.get(`/staff/${id}`),
  
  create: (data: Omit<Staff, 'id'>) =>
    api.post('/staff', data),
  
  update: (id: string, data: Partial<Staff>) =>
    api.put(`/staff/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/staff/${id}`),
};

