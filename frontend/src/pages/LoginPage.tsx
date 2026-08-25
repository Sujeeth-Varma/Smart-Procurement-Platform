import { Navbar } from '@/components/layout/Navbar';
import { LoginForm } from '@/components/auth/LoginForm';
import { motion } from 'motion/react';

export function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full flex justify-center"
        >
          <LoginForm />
        </motion.div>
      </main>
    </div>
  );
}
