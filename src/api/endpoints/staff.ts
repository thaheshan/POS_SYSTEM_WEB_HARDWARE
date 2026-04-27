import api from '../axiosInstance';

export const staffAPI = {
  getAll: (params?: any) =>
    api.get('/staff', { params }),
  
  getById: (id: string) =>
    api.get(`/staff/${id}`),
  
  create: (data: any) =>
    api.post('/staff', data),
  
  update: (id: string, data: any) =>
    api.put(`/staff/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/staff/${id}`),
};
