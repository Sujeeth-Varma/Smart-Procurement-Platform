import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Navbar } from '@/components/layout/Navbar';
import { adminApi } from '@/api/admin';
import { TrackingModal } from '@/components/modals/TrackingModal';
import { ProcessPaymentModal } from '@/components/modals/ProcessPaymentModal';
import type { ProcurementRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ShieldCheck,
  Check,
  X,
  Trash2,
  ArrowLeft,
  Search,
  Loader2,
  CreditCard,
  History,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminRequestsPage() {
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [trackingId, setTrackingId] = useState<number | null>(null);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPayReq, setSelectedPayReq] = useState<ProcurementRequest | null>(null);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllRequests().catch(() => adminApi.getPendingRequests());
      setRequests(data || []);
    } catch {
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleDecision = async (requestId: number, action: 'APPROVE' | 'REJECT') => {
    setActionLoadingId(requestId);
    try {
      await adminApi.updateRequestStatus(requestId, action);
      toast.success(`Request #${requestId} ${action === 'APPROVE' ? 'approved! Ready for payment.' : 'rejected.'}`);
      loadAll();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} request`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (requestId: number) => {
    setActionLoadingId(requestId);
    try {
      await adminApi.deleteRequest(requestId);
      toast.success(`Request #${requestId} deleted from system`);
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenPayment = (req: ProcurementRequest) => {
    setSelectedPayReq(req);
    setPaymentModalOpen(true);
  };

  const filtered = requests.filter((r) => {
    const matchSearch =
      (r.productName || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.userEmail || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.departmentName || '').toLowerCase().includes(search.toLowerCase()) ||
      String(r.requestId).includes(search);
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    if (status?.includes('ACTIVE') || status?.includes('APPROVED') || status?.includes('DELIVERED')) {
      return (
        <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
          <CheckCircle2 className="h-3 w-3" />
          {status}
        </Badge>
      );
    }
    if (status?.includes('CLOSED') || status?.includes('REJECTED')) {
      return (
        <Badge variant="outline" className="gap-1 bg-destructive/10 text-destructive border-destructive/20 text-xs">
          <XCircle className="h-3 w-3" />
          {status}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">
        <Clock className="h-3 w-3" />
        {status || 'PENDING'}
      </Badge>
    );
  };

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
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                All Requisition Approvals
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Review, approve with atomic stock verification, or reject requisitions across departments
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by ID, user email, or item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-background border-border/70"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'PENDING_FOR_APPROVAL', 'ACTIVE', 'CLOSED'].map((st) => (
              <Button
                key={st}
                variant={filterStatus === st ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(st)}
                className="h-8 text-[11px] rounded-lg"
              >
                {st === 'ALL' ? 'All Requests' : st === 'PENDING_FOR_APPROVAL' ? 'Pending' : st === 'ACTIVE' ? 'Approved' : 'Closed'}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card className="border-border/60 bg-card rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-sm font-bold text-foreground">
              Master Procurement Ledger ({filtered.length})
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Direct approval executes immediate stock deduction and notifies requesting user
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Loading ledger from backend...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No requisitions found matching the criteria.
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {filtered.map((req) => (
                  <div
                    key={req.requestId}
                    className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-1.5 max-w-lg">
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
                        {req.userEmail ? `User: ${req.userEmail}` : ''} {req.departmentName ? `• Dept: ${req.departmentName}` : ''}
                      </p>
                      {req.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {req.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-border/30">
                      <div className="text-left lg:text-right mr-2">
                        <div className="font-mono text-sm font-bold text-foreground">
                          ₹{(req.totalPrice || 0).toLocaleString()}
                        </div>
                        <div className="pt-0.5">{getStatusBadge(req.status)}</div>
                      </div>

                      {req.status?.includes('PENDING') ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            disabled={actionLoadingId === req.requestId}
                            onClick={() => handleDecision(req.requestId, 'APPROVE')}
                            className="h-8 gap-1 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoadingId === req.requestId}
                            onClick={() => handleDecision(req.requestId, 'REJECT')}
                            className="h-8 gap-1 rounded-xl text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      ) : req.status?.includes('ACTIVE') || req.status?.includes('APPROVED') ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenPayment(req)}
                          className="h-8 gap-1 text-xs rounded-xl border-primary/40 text-primary"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Process Payment
                        </Button>
                      ) : null}

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setTrackingId(req.requestId);
                            setTrackingOpen(true);
                          }}
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                          title="View Tracking History"
                        >
                          <History className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={actionLoadingId === req.requestId}
                          onClick={() => handleDelete(req.requestId)}
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                          title="Delete Record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      <TrackingModal
        open={trackingOpen}
        onOpenChange={setTrackingOpen}
        requestId={trackingId}
      />
      <ProcessPaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        requestId={selectedPayReq?.requestId || 1}
        productName={selectedPayReq?.productName}
        requestedQuantity={selectedPayReq?.requestedQuantity}
        userName={selectedPayReq?.userName}
        departmentName={selectedPayReq?.departmentName}
        amount={selectedPayReq?.totalPrice || 1000}
        onSuccess={loadAll}
      />
    </div>
  );
}
