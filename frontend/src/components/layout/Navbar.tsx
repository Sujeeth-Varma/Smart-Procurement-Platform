import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import {
  Boxes,
  Moon,
  Sun,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  User,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';

export function Navbar() {
  const { isAuthenticated, role, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out');
    navigate('/login');
  };

  const getDashboardPath = () => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'SUPPLIER':
        return '/supplier/dashboard';
      case 'USER':
      default:
        return '/user/dashboard';
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
      case 'SUPPLIER':
        return <Truck className="h-4 w-4 text-amber-500" />;
      default:
        return <User className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Branding */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20"
          >
            <Boxes className="h-5 w-5" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
              Procure<span className="text-primary">Flow</span>
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                AI SaaS
              </span>
            </span>
            <span className="text-[11px] text-muted-foreground -mt-0.5">
              Enterprise Procurement
            </span>
          </div>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a
            href="/#features"
            className="transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a
            href="/#workflow"
            className="transition-colors hover:text-foreground"
          >
            Workflow
          </a>
          <a
            href="/#tech"
            className="transition-colors hover:text-foreground"
          >
            Architecture
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 rounded-lg"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to={getDashboardPath()}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="sm" className="gap-2 rounded-lg shadow-sm">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="inline-flex items-center gap-1 text-xs opacity-90 border-l border-primary-foreground/30 pl-2 ml-0.5 font-normal">
                      {getRoleIcon()}
                      {role}
                    </span>
                  </Button>
                </motion.div>
              </Link>
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9 rounded-lg border-border/60 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="rounded-lg text-sm">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="sm" className="rounded-lg shadow-sm">
                    Register
                  </Button>
                </motion.div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
