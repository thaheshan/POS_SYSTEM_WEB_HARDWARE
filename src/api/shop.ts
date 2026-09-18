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

  async uploadLogo(file: File, token?: string) {
    const formData = new FormData();
    // Append all common field names for NestJS FileInterceptor ('file', 'logo', 'image', 'photo')
    formData.append('file', file);
    formData.append('logo', file);
    formData.append('image', file);
    formData.append('photo', file);

    const endpoints = [
      { method: 'post', url: '/shops/logo' },
      { method: 'patch', url: '/shops/logo' },
      { method: 'post', url: '/shops/profile/logo' },
      { method: 'post', url: '/shop/logo' },
      { method: 'patch', url: '/shops/profile' },
    ];

    let lastError: any = null;
    for (const ep of endpoints) {
      try {
        const res = ep.method === 'post' 
          ? await api.post(ep.url, formData)
          : await api.patch(ep.url, formData);
        const json = res.data?.data || res.data;
        if (json) return json;
      } catch (err: any) {
        lastError = err;
        // Continue trying alternative endpoint if server returned 404/405/500
      }
    }

    throw lastError || new Error('Failed to upload shop logo');
  },
};
