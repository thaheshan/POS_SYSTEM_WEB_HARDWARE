import api from '../axiosInstance';

export const suppliersAPI = {
  getAll: (params?: any) =>
    api.get('/suppliers', { params }),
  
  getById: (id: string) =>
    api.get(`/suppliers/${id}`),
  
  create: (data: any) =>
    api.post('/suppliers', data),
  
  update: (id: string, data: any) =>
    api.put(`/suppliers/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/suppliers/${id}`),
    
  getRequests: (params?: any) =>
    api.get('/suppliers/requests', { params }),
    
  approveRequest: (id: string) =>
    api.post(`/suppliers/requests/${id}/approve`),
    
  rejectRequest: (id: string, reason: string) =>
    api.post(`/suppliers/requests/${id}/reject`, { reason }),
};
