import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Navbar } from '@/components/layout/Navbar';
import { procurementApi } from '@/api/procurement';
import { TrackingModal } from '@/components/modals/TrackingModal';
import { RaiseRequestModal } from '@/components/modals/RaiseRequestModal';
import { ReviewModal } from '@/components/modals/ReviewModal';
import type { PaymentRecord, ProcurementRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  FileText,
  Plus,
  ArrowLeft,
  History,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Search,
  Star,
  Download,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function UserRequestsPage() {
  const [pendingRequests, setPendingRequests] = useState<ProcurementRequest[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const [trackingRequestId, setTrackingRequestId] = useState<number | null>(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [raiseModalOpen, setRaiseModalOpen] = useState(false);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRequestId, setReviewRequestId] = useState<number | null>(null);
  const [reviewProductName, setReviewProductName] = useState<string>('');

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [pending, userPayments] = await Promise.all([
        procurementApi.getPendingRequests().catch(() => []),
        procurementApi.getUserPayments().catch(() => []),
      ]);
      setPendingRequests(pending || []);
      setPayments(userPayments || []);
    } catch {
      setPendingRequests([]);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleExportCsv = async () => {
    try {
      window.open('/api/payment/user?exportCsv=true', '_blank');
      toast.success('Downloading user requisitions payment CSV...');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  const handleOpenReview = (requestId: number, productName?: string) => {
    setReviewRequestId(requestId);
    setReviewProductName(productName || '');
    setReviewModalOpen(true);
  };

  // Combine items
  const combinedItems: Array<{
    id: number;
    title: string;
    description?: string;
    amount: number;
    status: string;
    date?: string;
    isPayment: boolean;
    quantity?: number;
  }> = [
    ...pendingRequests.map((p) => ({
      id: p.requestId,
      title: p.productName || `Product #${p.productId}`,
      description: p.description,
      amount: p.totalPrice || 0,
      status: p.status,
      date: p.createdDate,
      isPayment: false,
      quantity: p.requestedQuantity,
    })),
    ...payments.map((pay) => ({
      id: pay.requestId,
      title: pay.productName || `Requisition #${pay.requestId}`,
      description: pay.remarks || `Settled payment of ₹${pay.amount} to ${pay.supplierName || 'supplier'}`,
      amount: pay.amount || 0,
      status: 'PAYMENT_COMPLETED',
      date: pay.transactionDate || pay.paymentDate,
      isPayment: true,
      quantity: 1,
    })),
  ];

  const filtered = combinedItems.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase()) ||
      String(item.id).includes(search);
    const matchStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'PENDING' && item.status.includes('PENDING')) ||
      (filterStatus === 'ACTIVE' && (item.status.includes('ACTIVE') || item.status.includes('APPROVED'))) ||
      (filterStatus === 'COMPLETED' && item.status.includes('COMPLETED'));
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    if (status.includes('COMPLETED') || status.includes('DELIVERED')) {
      return (
        <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
          <CheckCircle2 className="h-3 w-3" />
          {status}
        </Badge>
      );
    }
    if (status.includes('CLOSED') || status.includes('REJECTED')) {
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
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link to="/user/dashboard">
                <Button variant="ghost" size="sm" className="h-8 gap-1 pl-1 text-xs text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Dashboard
                </Button>
              </Link>
              <span className="text-muted-foreground">/</span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                My Procurement Requisitions
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Complete history of all your submitted hardware requisitions, audit trails, and payment receipts
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="gap-1.5 rounded-xl text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>

            <Button
              onClick={() => setRaiseModalOpen(true)}
              className="gap-2 rounded-xl text-xs shadow-md shadow-primary/20"
            >
              <Plus className="h-4 w-4" />
              Raise New Request
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by item, description, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-background border-border/70"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'PENDING', 'ACTIVE', 'COMPLETED'].map((st) => (
              <Button
                key={st}
                variant={filterStatus === st ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(st)}
                className="h-8 text-[11px] rounded-lg"
              >
                {st === 'ALL' ? 'All Orders' : st}
              </Button>
            ))}
          </div>
        </div>

        {/* Requisitions List Table */}
        <Card className="border-border/60 bg-card rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-sm font-bold text-foreground">
              Requisition Ledger ({filtered.length})
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Live orders fetched directly from backend database
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Loading requisitions...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No procurement requisitions match your criteria.
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {filtered.map((item) => (
                  <div
                    key={`${item.isPayment ? 'pay' : 'req'}-${item.id}`}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-1.5 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">
                          #{item.id}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {item.title}
                        </span>
                        {item.quantity && (
                          <Badge variant="outline" className="text-[10px] bg-muted">
                            Qty: {item.quantity}
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {item.description}
                        </p>
                      )}
                      {item.date && (
                        <div className="text-[11px] text-muted-foreground font-mono">
                          Timestamp: {item.date}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-border/30">
                      <div className="text-left sm:text-right mr-2">
                        <div className="font-mono text-sm font-bold text-foreground">
                          ₹{item.amount.toLocaleString()}
                        </div>
                        <div className="pt-0.5">{getStatusBadge(item.status)}</div>
                      </div>

                      {item.status.includes('COMPLETED') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenReview(item.id, item.title)}
                          className="h-8 gap-1 text-xs rounded-xl border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                        >
                          <Star className="h-3 w-3 fill-amber-500" />
                          Rate & Review
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTrackingRequestId(item.id);
                          setTrackingModalOpen(true);
                        }}
                        className="h-8 gap-1.5 text-xs rounded-xl"
                      >
                        <History className="h-3.5 w-3.5 text-primary" />
                        Audit Trail
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modals */}
      <TrackingModal
        open={trackingModalOpen}
        onOpenChange={setTrackingModalOpen}
        requestId={trackingRequestId}
      />
      <RaiseRequestModal
        open={raiseModalOpen}
        onOpenChange={setRaiseModalOpen}
        onSuccess={loadAll}
      />
      <ReviewModal
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        requestId={reviewRequestId}
        productName={reviewProductName}
      />
    </div>
  );
}
