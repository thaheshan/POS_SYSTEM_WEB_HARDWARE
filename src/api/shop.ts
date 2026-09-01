import api from './axiosInstance';

export const shopApi = {
  async getProfile() {
    const res = await api.get('/shops/profile');
    return res.data?.data || res.data;
  },

  async updateProfile(data: {
    name?: string;
    businessRegistration?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    district?: string;
    province?: string;
  }) {
    const res = await api.patch('/shops/profile', data);
    return res.data?.data || res.data;
  },

  async getSettings() {
    const res = await api.get('/shops/settings');
    return res.data?.data || res.data;
  },

  async updateSettings(data: Record<string, any>) {
    const res = await api.patch('/shops/settings', data);
    return res.data?.data || res.data;
  },

  async uploadLogo(file: File, token: string) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/shops/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const json = res.data?.data || res.data;
    return json;
  },
};
