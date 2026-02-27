import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import NotificationsPage from './_pages/notificationsPage.tsx'

const queryClient = new QueryClient()

function App() {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      <NotificationsPage />
    </QueryClientProvider>
  )
}

export default App
