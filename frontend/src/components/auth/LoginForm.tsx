import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { motion } from 'motion/react';
import { useAuthStore } from '@/stores/useAuthStore';
import { authApi } from '@/api/auth';
import type { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Mail, User, ShieldCheck, Truck, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function LoginForm() {
  const [role, setRole] = useState<UserRole>('USER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || (
    role === 'ADMIN' ? '/admin/dashboard' : role === 'SUPPLIER' ? '/supplier/dashboard' : '/user/dashboard'
  );

  const handleRoleChange = (newRole: string) => {
    setRole(newRole as UserRole);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.login(email, password, role);
      
      login(res.token, res.role, {
        userId: res.user?.userId || 1,
        name: res.user?.name || (role === 'ADMIN' ? 'System Administrator' : role === 'SUPPLIER' ? 'Supplier Representative' : 'Employee'),
        email,
        role: res.role,
        status: 'ACTIVE',
      });

      toast.success(res.message || `Login successful as ${res.role}`);

      // Determine redirect path
      let targetPath = from;
      if (!location.state?.from?.pathname) {
        if (res.role === 'ADMIN') targetPath = '/admin/dashboard';
        else if (res.role === 'SUPPLIER') targetPath = '/supplier/dashboard';
        else targetPath = '/user/dashboard';
      }

      navigate(targetPath, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-border/80 bg-card/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
          {role === 'ADMIN' ? (
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
          ) : role === 'SUPPLIER' ? (
            <Truck className="h-6 w-6 text-amber-500" />
          ) : (
            <User className="h-6 w-6 text-primary" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          Welcome to ProcureFlow
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Select your role to securely access your dedicated workspace
        </CardDescription>

        {/* Role Selector Tabs */}
        <div className="pt-2">
          <Tabs value={role} onValueChange={handleRoleChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="USER" className="text-xs rounded-lg gap-1.5 data-[state=active]:shadow-sm">
                <User className="h-3.5 w-3.5" />
                Employee
              </TabsTrigger>
              <TabsTrigger value="ADMIN" className="text-xs rounded-lg gap-1.5 data-[state=active]:shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Admin
              </TabsTrigger>
              <TabsTrigger value="SUPPLIER" className="text-xs rounded-lg gap-1.5 data-[state=active]:shadow-sm">
                <Truck className="h-3.5 w-3.5 text-amber-500" />
                Supplier
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-medium text-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={
                  role === 'ADMIN'
                    ? 'admin@company.com'
                    : role === 'SUPPLIER'
                    ? 'supplier@company.com'
                    : 'user@company.com'
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 h-11 text-sm rounded-xl bg-background/50 border-border/70 focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium text-foreground">
                Password
              </Label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 h-11 text-sm rounded-xl bg-background/50 border-border/70 focus:border-primary"
                required
              />
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl text-sm font-semibold gap-2 shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign in as {role === 'ADMIN' ? 'Administrator' : role === 'SUPPLIER' ? 'Supplier' : 'Employee'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-3 text-center border-t border-border/40 pt-4 pb-6">
        <p className="text-xs text-muted-foreground">
          New employee?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Register your account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
