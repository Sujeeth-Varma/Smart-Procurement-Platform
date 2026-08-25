import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/stores/useAuthStore';
import { apiClient } from '@/api/client';
import type { ProcurementRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ShieldCheck,
  Check,
  X,
  CreditCard,
  Users,
  Inbox,
  TrendingUp,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminDashboard() {
  const { user } = useAuthStore();
  const [pendingRequests, setPendingRequests] = useState<ProcurementRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadPending = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<ProcurementRequest[]>('/api/request/pending');
      setPendingRequests(data || []);
    } catch (err: any) {
      // Mock pending requests if backend offline or empty
      setPendingRequests([
        {
          requestId: 1,
          productName: '4K Monitor 27-inch',
          requestedQuantity: 2,
          pricePerUnit: 24999,
          totalPrice: 49998,
          userEmail: 'om@gmail.com',
          departmentName: 'IT',
          status: 'PENDING_FOR_APPROVAL',
        },
        {
          requestId: 2,
          productName: 'Wireless Mouse',
          requestedQuantity: 5,
          pricePerUnit: 800,
          totalPrice: 4000,
          userEmail: 'priya@company.com',
          departmentName: 'HR',
          status: 'PENDING_FOR_APPROVAL',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleDecision = async (requestId: number, action: 'approve' | 'reject') => {
    setProcessingId(requestId);
    try {
      await apiClient('/api/request/status', {
        method: 'POST',
        body: JSON.stringify({ requestId, status: action }),
      });
      toast.success(`Request #${requestId} successfully ${action}d! Stock updated.`);
      setPendingRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} request`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Administrator Command Center
              </h1>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
                SINGLE ADMIN • SYSTEM GOVERNANCE
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
              <span>Admin: <strong className="text-foreground">{user?.email || 'admin@company.com'}</strong></span>
              <span>•</span>
              <span>All Department Requisitions & Supplier Gateway Control</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadPending}
              disabled={isLoading}
              className="gap-1.5 rounded-xl text-xs"
            >
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Inbox className="h-3.5 w-3.5" />}
              Refresh Queue
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/60 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pending Approval Queue
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{pendingRequests.length}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Requires admin authorization</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Budget Processed
              </CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹53,998</div>
              <p className="text-[11px] text-muted-foreground mt-1">Disbursed to suppliers</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Suppliers
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">2 Partners</div>
              <p className="text-[11px] text-muted-foreground mt-1">Logitech & Steelcase</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Registered Employees
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">18 Users</div>
              <p className="text-[11px] text-muted-foreground mt-1">4 corporate departments</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests Queue Table */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  Pending Requisitions Awaiting Approval
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Review employee hardware orders and execute real-time stock deduction
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
                {pendingRequests.length} pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {pendingRequests.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                🎉 No pending requests in the approval queue! All requisitions have been processed.
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {pendingRequests.map((req) => (
                  <div
                    key={req.requestId}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">
                          #{req.requestId}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {req.productName || `Product #${req.productId}`}
                        </span>
                        <Badge variant="outline" className="text-[10px] bg-muted">
                          Qty: {req.requestedQuantity || req.quantity || 1}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Requested by <span className="text-foreground">{req.userEmail || 'employee@company.com'}</span> • Dept: <span className="text-foreground font-medium">{req.departmentName || 'IT'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold text-foreground">
                          ₹{req.totalPrice || 1600}
                        </div>
                        <span className="text-[10px] text-muted-foreground">Total Budget</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          disabled={processingId === req.requestId}
                          onClick={() => handleDecision(req.requestId, 'approve')}
                          className="h-8 gap-1 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        >
                          {processingId === req.requestId ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={processingId === req.requestId}
                          onClick={() => handleDecision(req.requestId, 'reject')}
                          className="h-8 gap-1 rounded-lg text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
