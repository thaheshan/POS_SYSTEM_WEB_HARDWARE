import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const TOKEN_KEY = 'pos_mobile_token';

const BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8080/api/v1' 
  : 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error('Failed to load auth token:', e);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem('pos_user');
    }
    return Promise.reject(error);
  }
);

export default api;
