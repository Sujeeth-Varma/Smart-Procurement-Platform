import { BrowserRouter } from 'react-router';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AppRoutes } from '@/routes/AppRoutes';

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ep-procure-theme">
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
