import api from '../axiosInstance';

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () =>
    api.post('/auth/logout'),
  getMe: () =>
    api.get('/auth/me'),
};
