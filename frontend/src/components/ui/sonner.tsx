import { useTheme } from '@/components/theme-provider';
import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : 'system'}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl font-sans',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
    />
  );
}
