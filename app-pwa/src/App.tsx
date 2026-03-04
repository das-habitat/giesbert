import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@fontsource-variable/noto-sans';
import '@fontsource-variable/noto-sans-mono';
import '@fontsource/jersey-15/400.css';
import NotificationsPage from './notifications/page.tsx';
import Footer from './common/ui-components/Footer.tsx';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <>
        <NotificationsPage />
        <Footer />
      </>
    </QueryClientProvider>
  );
}

export default App;
