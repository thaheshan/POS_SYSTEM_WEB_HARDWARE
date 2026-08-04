'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { toastError, toastSuccess } from '@/lib/toast';

export default function GlobalToaster() {
  useEffect(() => {
    const handleOffline = () => toastError(new Error('You appear to be offline. Please check your internet connection.'));
    const handleOnline = () => toastSuccess('You’re back online. Your internet connection has been restored.');

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <Toaster
      position="top-right"
      gutter={8}
      containerStyle={{ top: 72, right: 16, zIndex: 10000 }}
      toastOptions={{ duration: 4000 }}
    />
  );
}
