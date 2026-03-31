'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setUser, setToken, logout as logoutAction } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      // Demo login - allowing the default email and any password for the demo
      if (email === 'admin@abchardware.lk' || email === 'admin@example.com') {
        const user = {
          id: '1',
          email: email,
          name: 'John Silva',
          role: 'Shop Owner',
        };
        const token = 'demo-token-123';
        
        dispatch(setUser(user));
        dispatch(setToken(token));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        router.push('/dashboard');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  return {
    ...auth,
    login,
    logout,
    isLoading: false,
  };
};
