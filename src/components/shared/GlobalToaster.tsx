'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { toastError, toastSuccess } from '@/lib/toast';

export default function GlobalToaster() {
  useEffect(() => {
    const handleOffline = () => toastError(new Error('You appear to be offline. Please check your internet connection.'));
    const handleOnline = () => toastSuccess('You’re back online. Your internet connection has been restored.');

    // Strict global prevention of scroll wheel value changes on number inputs
    const handleWheel = (e: WheelEvent) => {
      const activeEl = document.activeElement as HTMLInputElement;
      if (activeEl && activeEl.tagName === 'INPUT' && activeEl.type === 'number') {
        e.preventDefault();
        activeEl.blur();
      }
    };

    // Strict global prevention of ArrowUp / ArrowDown key value changes on number inputs
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLInputElement;
      if (activeEl && activeEl.tagName === 'INPUT' && activeEl.type === 'number') {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown, true);
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
