import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Navbar } from '@/components/layout/Navbar';
import { adminApi } from '@/api/admin';
import type { Supplier, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Truck,
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Building,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'SUPPLIERS'>('EMPLOYEES');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [uList, sList] = await Promise.all([
          adminApi.getUsers().catch(() => []),
          adminApi.getSuppliers().catch(() => []),
        ]);
        setUsers(uList || []);
        setSuppliers(sList || []);
      } catch {
        setUsers([]);
        setSuppliers([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link to="/admin/dashboard">
                <Button variant="ghost" size="sm" className="h-8 gap-1 pl-1 text-xs text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Dashboard
                </Button>
              </Link>
              <span className="text-muted-foreground">/</span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Organizational Directory
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Master registry of verified internal employees and external supplier partners
            </p>
          </div>

          {/* Role Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full sm:w-auto">
            <TabsList className="grid w-full sm:w-64 grid-cols-2 bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="EMPLOYEES" className="text-xs rounded-lg gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Employees ({users.length})
              </TabsTrigger>
              <TabsTrigger value="SUPPLIERS" className="text-xs rounded-lg gap-1.5">
                <Truck className="h-3.5 w-3.5" />
                Suppliers ({suppliers.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Directory Content */}
        {activeTab === 'EMPLOYEES' ? (
          <Card className="border-border/60 bg-card rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-bold text-foreground">
                Registered Employees Directory ({users.length})
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Active employee accounts fetched from backend database
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Loading directory from backend...
                </div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No registered users found.
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {users.map((u) => (
                    <div
                      key={u.userId}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">{u.name}</span>
                          <Badge variant="outline" className={`text-[10px] ${u.role === 'ADMIN' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                            {u.role || 'USER'}
                          </Badge>
                          {u.status && (
                            <Badge variant="outline" className="text-[10px] bg-muted">
                              <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500 inline" />
                              {u.status}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {u.email}
                          </span>
                          {u.phoneNumber && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5" />
                              {u.phoneNumber}
                            </span>
                          )}
                          {u.designation && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5" />
                              {u.designation}
                            </span>
                          )}
                          {u.department && (
                            <span className="flex items-center gap-1">
                              <Building className="h-3.5 w-3.5" />
                              {u.department.departmentName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/60 bg-card rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-bold text-foreground">
                Authorized Supplier Network ({suppliers.length})
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Registered hardware and corporate equipment vendor partners
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Loading supplier network...
                </div>
              ) : suppliers.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No registered suppliers found.
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {suppliers.map((s) => (
                    <div
                      key={s.supplierId}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">{s.name}</span>
                          {s.status && (
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20">
                              {s.status}
                            </Badge>
                          )}
                          {s.rating && (
                            <Badge variant="outline" className="text-[10px] bg-muted">
                              Rating: {s.rating} / 5.0
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {s.email}
                          </span>
                          {s.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5" />
                              {s.phone}
                            </span>
                          )}
                          {s.address && (
                            <span className="flex items-center gap-1">
                              <Building className="h-3.5 w-3.5" />
                              {s.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
