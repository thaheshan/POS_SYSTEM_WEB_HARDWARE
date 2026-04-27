import api from '../axiosInstance';

export const inventoryAPI = {
  getAll: (params?: any) =>
    api.get('/inventory', { params }),
  
  getById: (id: string) =>
    api.get(`/inventory/${id}`),
  
  updateStock: (id: string, data: any) =>
    api.put(`/inventory/${id}/stock`, data),
  
  getLowStock: (params?: any) =>
    api.get('/inventory/low-stock', { params }),
};
