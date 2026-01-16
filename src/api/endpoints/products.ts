import api from '../axiosInstance';

export const productsAPI = {
  getAll: (params?: any) =>
    api.get('/products', { params }),
  
  getById: (id: string) =>
    api.get(`/products/${id}`),
  
  create: (data: any) =>
    api.post('/products', data),
  
  update: (id: string, data: any) =>
    api.put(`/products/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/products/${id}`),
  
  searchByBarcode: (barcode: string) =>
    api.get(`/products/barcode/${barcode}`),
};
