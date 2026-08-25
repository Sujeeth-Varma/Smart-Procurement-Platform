import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Navbar } from '@/components/layout/Navbar';
import { adminApi } from '@/api/admin';
import type { PaymentRecord, ProcurementRequest } from '@/types';
import { ProcessPaymentModal } from '@/components/modals/ProcessPaymentModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  CreditCard,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Receipt,
  Loader2,
  Download,
  Building,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminPaymentsPage() {
  const [approvedRequests, setApprovedRequests] = useState<ProcurementRequest[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPayReq, setSelectedPayReq] = useState<ProcurementRequest | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [approvedList, payList] = await Promise.all([
        adminApi.getApprovedRequests().catch(() => []),
        adminApi.getPaymentHistory().catch(() => []),
      ]);
      setApprovedRequests(approvedList || []);
      setPayments(payList || []);
    } catch {
      setApprovedRequests([]);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenPayment = (req?: ProcurementRequest) => {
    setSelectedPayReq(req || null);
    setPaymentModalOpen(true);
  };

  const handleExportCsv = () => {
    try {
      window.open('/api/payment/history?exportCsv=true', '_blank');
      toast.success('Downloading payments ledger CSV...');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
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
                <CreditCard className="h-5 w-5 text-emerald-500" />
                Supplier Payments & Remittance Gateway
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Disburse bank remittances for approved hardware requisitions to trigger supplier shipping
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
              onClick={() => handleOpenPayment()}
              className="gap-2 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
            >
              <Plus className="h-4 w-4" />
              Direct Payment
            </Button>
          </div>
        </div>

        {/* 1. Approved Products Waiting For Supplier Payment */}
        <Card className="border-border/60 bg-card rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Approved Products Waiting for Payment ({approvedRequests.length})
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Requisitions approved by Admin. Pay with test credit card credentials to dispatch to supplier.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
                Action Required
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Loading approved requests...
              </div>
            ) : approvedRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-foreground">No approved orders waiting for payment.</p>
                <p>All approved requisitions have been disbursed to supplier bank accounts.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {approvedRequests.map((req) => (
                  <div
                    key={req.requestId}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-1.5 max-w-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">
                          #ORD-00{req.requestId}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {req.productName || `Product #${req.productId}`}
                        </span>
                        <Badge variant="outline" className="text-[10px] bg-muted">
                          Qty: {req.requestedQuantity || 1}
                        </Badge>
                        {req.categoryName && (
                          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                            {req.categoryName}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>Requester: <strong className="text-foreground">{req.userName || req.userEmail}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {req.departmentName || 'Enterprise'}
                        </span>
                        {req.description && (
                          <>
                            <span>•</span>
                            <span className="italic line-clamp-1">"{req.description}"</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/30">
                      <div className="text-left sm:text-right">
                        <div className="font-mono text-base font-bold text-emerald-500">
                          ₹{(req.totalPrice || 0).toLocaleString()}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          Total Payable
                        </span>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleOpenPayment(req)}
                        className="h-9 px-3.5 gap-1.5 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        Pay Supplier
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Settlement Receipts Ledger & History */}
        <Card className="border-border/60 bg-card rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-500" />
              Settlement Receipts & History ({payments.length})
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Official transaction receipts for disbursements completed to authorized suppliers
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Loading ledger from backend...
              </div>
            ) : payments.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No payment transactions recorded in the system.
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {payments.map((p) => (
                  <div
                    key={p.paymentId}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">
                          #PAY-{p.paymentId}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {p.productName || `Requisition #${p.requestId}`}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          ➔ {p.supplierName || 'Authorized Vendor'}
                        </span>
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                          {p.paymentStatus || p.status || 'SUCCESS'}
                        </Badge>
                      </div>
                      {p.remarks && (
                        <p className="text-xs text-muted-foreground">
                          {p.remarks}
                        </p>
                      )}
                      <div className="text-[11px] text-muted-foreground font-mono">
                        Requisition #{p.requestId} {p.transactionDate ? `• Date: ${p.transactionDate}` : ''}
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="font-mono text-base font-bold text-foreground">
                        ₹{(p.amount || 0).toLocaleString()}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Direct Bank Gateway
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <ProcessPaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        requestId={selectedPayReq?.requestId || 1}
        productName={selectedPayReq?.productName}
        requestedQuantity={selectedPayReq?.requestedQuantity}
        userName={selectedPayReq?.userName}
        departmentName={selectedPayReq?.departmentName}
        amount={selectedPayReq?.totalPrice || 1000}
        onSuccess={loadData}
      />
    </div>
  );
}
