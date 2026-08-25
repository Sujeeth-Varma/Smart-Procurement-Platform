import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { authApi } from '@/api/auth';
import type { Department } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, Lock, Phone, Briefcase, Building2, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [designation, setDesignation] = useState('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepts, setIsLoadingDepts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadDepartments() {
      setIsLoadingDepts(true);
      try {
        const depts = await authApi.getDepartments();
        setDepartments(depts || []);
        if (depts && depts.length > 0) {
          setDepartmentId(depts[0].departmentId);
        }
      } catch {
        setDepartments([]);
      } finally {
        setIsLoadingDepts(false);
      }
    }
    loadDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !phoneNumber || !designation || !departmentId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.register({
        name,
        email,
        password,
        phoneNumber,
        designation,
        departmentId: Number(departmentId),
      });

      toast.success(res.message || 'Registration successful! Please log in with your credentials.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg border-border/80 bg-card/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
          <UserPlus className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          Employee Registration
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Join your organization's automated procurement workflow
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-medium text-foreground">
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 text-sm rounded-xl bg-background/50 border-border/70 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-foreground">
                Corporate Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-10 text-sm rounded-xl bg-background/50 border-border/70 focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-xs font-medium text-foreground">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-9 h-10 text-sm rounded-xl bg-background/50 border-border/70 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation" className="text-xs font-medium text-foreground">
                Designation
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="designation"
                  placeholder="Software Engineer"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="pl-9 h-10 text-sm rounded-xl bg-background/50 border-border/70 focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department" className="text-xs font-medium text-foreground flex items-center justify-between">
                <span>Department</span>
                {isLoadingDepts && <span className="text-[10px] text-muted-foreground">Loading...</span>}
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <select
                  id="department"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(Number(e.target.value))}
                  className="w-full pl-9 pr-3 h-10 text-sm rounded-xl bg-background/50 border border-border/70 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  required
                >
                  {departments.map((d) => (
                    <option key={d.departmentId} value={d.departmentId} className="bg-card text-card-foreground">
                      {d.departmentName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-10 text-sm rounded-xl bg-background/50 border-border/70 focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl text-sm font-semibold gap-2 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Complete Registration
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-3 text-center border-t border-border/40 pt-4 pb-6">
        <p className="text-xs text-muted-foreground">
          Already registered?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in to your account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
