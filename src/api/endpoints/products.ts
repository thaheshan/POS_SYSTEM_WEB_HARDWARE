import api from "../axiosInstance";

export const productsAPI = {
  getAll: (params?: any) => api.get("/products", { params }),

  getById: (id: string) => api.get(`/products/${id}`),

  create: (data: any) => api.post("/products", data),

  update: (id: string, data: any) => api.put(`/products/${id}`, data),

  delete: (id: string) => api.delete(`/products/${id}`),

  searchByBarcode: (barcode: string) => api.get(`/products/barcode/${barcode}`),

  updateDiscountConfig: (
    id: string,
    data: {
      isDiscountEnabled?: boolean;
      discountType?: "PERCENTAGE" | "FIXED_AMOUNT";
      maxAllowedDiscount?: number;
      defaultDiscountValue?: number;
    },
  ) => api.patch(`/products/${id}/discount-config`, data),

  approveDiscount: (id: string, data: { isDiscountApproved: boolean }) =>
    api.patch(`/products/${id}/discount-approval`, data),

  /* ─── Brand endpoints ─── */
  getBrands: (subcategoryId?: string) =>
    api.get("/products/brands", { params: subcategoryId ? { subcategoryId } : {} }),

  createBrand: (data: { name: string; categoryId?: string; description?: string }) =>
    api.post("/products/brands", data),

  updateBrand: (id: string, data: { name?: string; description?: string }) =>
    api.patch(`/products/brands/${id}`, data),

  deleteBrand: (id: string) => api.delete(`/products/brands/${id}`),
};

