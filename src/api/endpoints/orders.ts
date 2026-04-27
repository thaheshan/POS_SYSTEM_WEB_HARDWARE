import api from '../axiosInstance';

export const ordersAPI = {
  getAll: (params?: any) =>
    api.get('/orders', { params }),
  
  getById: (id: string) =>
    api.get(`/orders/${id}`),
  
  create: (data: any) =>
    api.post('/orders', data),
  
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
  
  delete: (id: string) =>
    api.delete(`/orders/${id}`),
};
