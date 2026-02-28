import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NotificationsPage from './notifications/page.tsx';
import '@fontsource-variable/noto-sans';
import '@fontsource-variable/noto-sans-mono';
import '@fontsource/jersey-15/400.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationsPage />
    </QueryClientProvider>
  );
}

export default App;
