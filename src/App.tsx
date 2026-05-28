import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useTranslation } from 'react-i18next';
import { AppRoutes } from './routes/AppRoutes';
import './config/i18n'; // Ensure i18n is initialized

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const direction = i18n.dir();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          key={direction}
          position="top-center"
          richColors
          dir={direction}
          toastOptions={{
            classNames: {
              toast: 'text-start',
              content: 'text-start',
              title: 'text-start',
              description: 'text-start',
            },
          }}
          containerAriaLabel={t('notifications')}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
