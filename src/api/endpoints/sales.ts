import api from '../axiosInstance';

export const salesAPI = {
  getAll: (params?: any) =>
    api.get('/sales', { params }),
  
  getById: (id: string) =>
    api.get(`/sales/${id}`),
  
  create: (data: any) =>
    api.post('/sales', data),
  
  getReport: (startDate: string, endDate: string) =>
    api.get('/sales/report', { params: { startDate, endDate } }),
};
