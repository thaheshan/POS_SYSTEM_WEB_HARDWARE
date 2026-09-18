'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { NotificationProvider } from '@/hooks/useNotifications';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </Provider>
  );
}