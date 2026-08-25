import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Navbar } from '@/components/layout/Navbar';
import { adminApi } from '@/api/admin';
import { ProcessPaymentModal } from '@/components/modals/ProcessPaymentModal';
import type { PaymentRecord, ProcurementRequest, Supplier, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ShieldCheck,
  Check,
  X,
  CreditCard,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Loader2,
  Box,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminDashboard() {
  const [pendingRequests, setPendingRequests] = useState<ProcurementRequest[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<ProcurementRequest[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPayRequest, setSelectedPayRequest] = useState<ProcurementRequest | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pendingList, approvedList, payList, supList, userList] = await Promise.all([
        adminApi.getPendingRequests().catch(() => []),
        adminApi.getApprovedRequests().catch(() => []),
        adminApi.getPaymentHistory().catch(() => []),
        adminApi.getSuppliers().catch(() => []),
        adminApi.getUsers().catch(() => []),
      ]);
      setPendingRequests(pendingList || []);
      setApprovedRequests(approvedList || []);
      setPayments(payList || []);
      setSuppliers(supList || []);
      setUsers(userList || []);
    } catch {
      setPendingRequests([]);
      setApprovedRequests([]);
      setPayments([]);
      setSuppliers([]);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDecision = async (requestId: number, action: 'APPROVE' | 'REJECT') => {
    setActionId(requestId);
    try {
      await adminApi.updateRequestStatus(requestId, action);
      toast.success(
        `Request #${requestId} ${action === 'APPROVE' ? 'approved! Ready for supplier payment.' : 'rejected.'}`
      );
      loadData();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} request`);
    } finally {
      setActionId(null);
    }
  };

  const handleOpenPayment = (req?: ProcurementRequest) => {
    setSelectedPayRequest(req || null);
    setPaymentModalOpen(true);
  };

  const totalDisbursed = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

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
                SINGLE ADMIN GOVERNANCE
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Authorize requisitions, disburse supplier payments, and monitor company-wide procurement
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleOpenPayment()}
              className="gap-2 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
            >
              <CreditCard className="h-4 w-4" />
              Direct Supplier Payment
            </Button>
          </div>
        </div>

        {/* High-Level Overview KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/60 bg-card rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pending Approvals
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${pendingRequests.length} Orders`}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Awaiting your approval decision</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Awaiting Payment
              </CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${approvedRequests.length} Orders`}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Approved, ready for payment</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Remitted
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `₹${totalDisbursed.toLocaleString()}`}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {payments.length} supplier disbursements
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Organization Network
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${users.length} Users`}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{suppliers.length} active suppliers</p>
            </CardContent>
          </Card>
        </div>

        {/* 2-Column Working Station */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Urgent Approvals Queue */}
          <Card className="border-border/60 bg-card rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <CardHeader className="border-b border-border/40 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      1. Requisitions Awaiting Approval ({pendingRequests.length})
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Approve or reject employee hardware requisitions
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20">
                    Action Required
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Checking pending approvals...
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    All employee requisitions have been processed. Queue is clear.
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {pendingRequests.slice(0, 4).map((req) => (
                      <div
                        key={req.requestId}
                        className="p-4 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                      >
                        <div className="space-y-1 max-w-[240px]">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-primary">#{req.requestId}</span>
                            <span className="text-xs font-bold text-foreground line-clamp-1">
                              {req.productName || `Product #${req.productId}`}
                            </span>
                            <Badge variant="outline" className="text-[9px] px-1 py-0 bg-muted">
                              Qty: {req.requestedQuantity || 1}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {req.userName || req.userEmail} • {req.departmentName || 'IT'}
                          </p>
                          <div className="font-mono text-xs font-bold text-foreground">
                            ₹{(req.totalPrice || 0).toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            disabled={actionId === req.requestId}
                            onClick={() => handleDecision(req.requestId, 'APPROVE')}
                            className="h-8 px-2.5 gap-1 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionId === req.requestId}
                            onClick={() => handleDecision(req.requestId, 'REJECT')}
                            className="h-8 px-2.5 gap-1 rounded-xl text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </div>

            <div className="border-t border-border/40 p-4 bg-muted/10">
              <Link
                to="/admin/requests"
                className="text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1.5"
              >
                View Full Requisitions Approval Station
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>

          {/* Section 2: Approved Products Requiring Payment */}
          <Card className="border-border/60 bg-card rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <CardHeader className="border-b border-border/40 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-emerald-500" />
                      2. Products Requiring Supplier Payment ({approvedRequests.length})
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Disburse payment to authorized supplier to trigger shipping
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    Payment Gateway
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Checking approved orders...
                  </div>
                ) : approvedRequests.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
                    <Check className="h-6 w-6 text-emerald-500 mx-auto" />
                    <p>No approved products awaiting payment.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {approvedRequests.slice(0, 4).map((req) => (
                      <div
                        key={req.requestId}
                        className="p-4 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                      >
                        <div className="space-y-1 max-w-[240px]">
                          <div className="flex items-center gap-2">
                            <Box className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-bold text-foreground line-clamp-1">
                              {req.productName || `Product #${req.productId}`}
                            </span>
                            <Badge variant="outline" className="text-[9px] px-1 py-0 bg-muted">
                              Qty: {req.requestedQuantity || 1}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <span>Order #{req.requestId}</span>
                            <span>•</span>
                            <Building className="h-3 w-3" />
                            <span>{req.departmentName || 'IT'}</span>
                          </p>
                          <div className="font-mono text-xs font-bold text-emerald-500">
                            ₹{(req.totalPrice || 0).toLocaleString()}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleOpenPayment(req)}
                          className="h-8 px-3 gap-1.5 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Pay Supplier
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </div>

            <div className="border-t border-border/40 p-4 bg-muted/10">
              <Link
                to="/admin/payments"
                className="text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1.5"
              >
                View Supplier Payments Ledger & History
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <ProcessPaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        requestId={selectedPayRequest?.requestId || 1}
        productName={selectedPayRequest?.productName}
        requestedQuantity={selectedPayRequest?.requestedQuantity}
        userName={selectedPayRequest?.userName}
        departmentName={selectedPayRequest?.departmentName}
        amount={selectedPayRequest?.totalPrice || 1000}
        onSuccess={loadData}
      />
    </div>
  );
}
