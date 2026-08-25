import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/stores/useAuthStore';
import { procurementApi } from '@/api/procurement';
import { RaiseRequestModal } from '@/components/modals/RaiseRequestModal';
import { TrackingModal } from '@/components/modals/TrackingModal';
import type { Product, ProcurementRequest, PaymentRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Boxes,
  Plus,
  Clock,
  CheckCircle2,
  FileText,
  Building,
  ArrowRight,
  History,
  ShoppingCart,
  Loader2,
  PackageCheck,
} from 'lucide-react';

export function UserDashboard() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ProcurementRequest[]>([]);
  const [completedPayments, setCompletedPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [raiseModalOpen, setRaiseModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedTrackingId, setSelectedTrackingId] = useState<number | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodList, pendingList, payList] = await Promise.all([
        procurementApi.getProducts().catch(() => []),
        procurementApi.getPendingRequests().catch(() => []),
        procurementApi.getUserPayments().catch(() => []),
      ]);
      setProducts(prodList || []);
      setPendingRequests(pendingList || []);
      setCompletedPayments(payList || []);
    } catch {
      setProducts([]);
      setPendingRequests([]);
      setCompletedPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickRequest = (p?: Product) => {
    setSelectedProduct(p || null);
    setRaiseModalOpen(true);
  };

  const handleOpenTracking = (id: number) => {
    setSelectedTrackingId(id);
    setTrackingModalOpen(true);
  };

  const totalRequisitionsCount = pendingRequests.length + completedPayments.length;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Employee Workspace
              </h1>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                EMPLOYEE
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
              <span>Account: <strong className="text-foreground">{user?.email || 'user@company.com'}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-muted-foreground" />
                Department: {user?.department?.departmentName || 'Enterprise'}
              </span>
            </p>
          </div>

          <Button onClick={() => handleQuickRequest()} className="gap-2 rounded-xl shadow-md shadow-primary/20">
            <Plus className="h-4 w-4" />
            Raise Procurement Request
          </Button>
        </div>

        {/* High-Level Overview KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/60 bg-card rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                My Requisitions
              </CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${totalRequisitionsCount} Total`}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Live active & completed orders</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pending Approvals
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${pendingRequests.length} Pending`}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Awaiting admin authorization</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Settled / Completed
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${completedPayments.length} Settled`}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Payment processed to supplier</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Catalog Items
              </CardTitle>
              <Boxes className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${products.length} Items`}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Eligible for requisition</p>
            </CardContent>
          </Card>
        </div>

        {/* 2-Column Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Requisitions Snippet */}
          <Card className="border-border/60 bg-card rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <CardHeader className="border-b border-border/40 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Pending & Active Requisitions
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Real-time status of orders in the procurement pipeline
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-muted">
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Fetching requisitions...
                  </div>
                ) : pendingRequests.length === 0 && completedPayments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
                    <PackageCheck className="h-6 w-6 text-muted-foreground mx-auto" />
                    <p>No procurement requests found.</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickRequest()}
                      className="h-8 text-xs rounded-xl"
                    >
                      Raise your first requisition
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {pendingRequests.slice(0, 3).map((req) => (
                      <div key={req.requestId} className="p-4 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-primary">#{req.requestId}</span>
                            <span className="text-xs font-bold text-foreground">{req.productName || `Product #${req.productId}`}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            Qty: {req.requestedQuantity || 1} • ₹{(req.totalPrice || 0).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20"
                          >
                            {req.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenTracking(req.requestId)}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                            title="View audit trail"
                          >
                            <History className="h-3.5 w-3.5" />
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
                to="/user/requests"
                className="text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1.5"
              >
                View Full Requisitions & Audit History
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>

          {/* Popular Catalog Snippet */}
          <Card className="border-border/60 bg-card rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <CardHeader className="border-b border-border/40 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Boxes className="h-4 w-4 text-primary" />
                      Approved Catalog Equipment
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Active equipment eligible for immediate requisition
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    Live Catalog
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Fetching equipment...
                  </div>
                ) : products.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No products currently available in catalog.
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {products.slice(0, 3).map((p) => (
                      <div key={p.productId} className="p-4 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-foreground">{p.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            ₹{(p.price || p.pricePerProduct || 0).toLocaleString()} • {p.status || 'ACTIVE'}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickRequest(p)}
                          className="h-8 text-xs rounded-xl gap-1.5"
                        >
                          <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                          Request
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </div>

            <div className="border-t border-border/40 p-4 bg-muted/10">
              <Link
                to="/user/catalog"
                className="text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1.5"
              >
                Browse Full Catalog & Categories
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <RaiseRequestModal
        open={raiseModalOpen}
        onOpenChange={setRaiseModalOpen}
        preselectedProduct={selectedProduct}
        onSuccess={loadData}
      />
      <TrackingModal
        open={trackingModalOpen}
        onOpenChange={setTrackingModalOpen}
        requestId={selectedTrackingId}
      />
    </div>
  );
}
