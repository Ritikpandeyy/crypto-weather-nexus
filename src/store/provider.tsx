'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { useEffect } from 'react';
import { alertService } from '@/services/websocket';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize alert service
    alertService.connect();
    
    // Request notification permission
    alertService.requestNotificationPermission();

    // Cleanup on unmount
    return () => {
      alertService.disconnect();
    };
  }, []);

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
} 