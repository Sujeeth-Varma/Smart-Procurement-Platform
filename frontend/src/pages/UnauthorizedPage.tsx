import { Link } from 'react-router';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'motion/react';

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md space-y-6"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Access Restricted (403)
            </h1>
            <p className="text-sm text-muted-foreground">
              You do not have the required role or authorization to access this dashboard.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link to="/">
              <Button variant="outline" className="gap-2 rounded-xl">
                <Home className="h-4 w-4" />
                Return Home
              </Button>
            </Link>
            <Link to="/login">
              <Button className="gap-2 rounded-xl">
                <ArrowLeft className="h-4 w-4" />
                Switch Account
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
