import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/stores/useAuthStore';
import { procurementApi } from '@/api/procurement';
import { supplierApi } from '@/api/supplier';
import { RestockModal } from '@/components/modals/RestockModal';
import { TrackingModal } from '@/components/modals/TrackingModal';
import type { Product, ProcurementRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Truck,
  CheckCircle2,
  PackageCheck,
  Send,
  Boxes,
  Building2,
  Loader2,
  ArrowRight,
  Sparkles,
  History,
} from 'lucide-react';
import { toast } from 'sonner';

export function SupplierDashboard() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<ProcurementRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shippingId, setShippingId] = useState<number | null>(null);
  const [restockModalOpen, setRestockModalOpen] = useState(false);

  const [trackingId, setTrackingId] = useState<number | null>(null);
  const [trackingOpen, setTrackingOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodList, orderList] = await Promise.all([
        procurementApi.getProducts().catch(() => []),
        supplierApi.getSupplierOrders().catch(() => []),
      ]);
      setProducts(prodList || []);
      setOrders(orderList || []);
    } catch {
      setProducts([]);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getNextStage = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s.includes('DELIVERED')) return null;
    if (s.includes('OUT_FOR_DELIVERY')) {
      return { nextStatus: 'DELIVERED' as const, label: 'Confirm Delivered' };
    }
    if (s.includes('DISPATCHED') || s.includes('SHIPPED')) {
      return { nextStatus: 'OUT_FOR_DELIVERY' as const, label: 'Mark Out for Delivery' };
    }
    if (s.includes('ORDER_PACKED')) {
      return { nextStatus: 'ORDER_DISPATCHED' as const, label: 'Dispatch Order' };
    }
    if (s.includes('ORDER_RECEIVED')) {
      return { nextStatus: 'ORDER_PACKED' as const, label: 'Pack Order' };
    }
    return { nextStatus: 'ORDER_RECEIVED' as const, label: 'Acknowledge' };
  };

  const handleShipOrder = async (requestId: number, nextStatus: any = 'ORDER_DISPATCHED') => {
    setShippingId(requestId);
    try {
      await supplierApi.updateOrderStatus(requestId, nextStatus, 'Supplier dispatch action from dashboard');
      toast.success(`Order #${requestId} updated to ${nextStatus}!`);
      setOrders((prev) =>
        prev.map((o) => (o.requestId === requestId ? { ...o, status: nextStatus } : o))
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setShippingId(null);
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
                Supplier Fulfillment Hub
              </h1>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">
                AUTHORIZED VENDOR PORTAL
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
              <span>Vendor Account: <strong className="text-foreground">{user?.email || 'supplier@company.com'}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Company: {user?.name || 'Verified Supplier'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => setRestockModalOpen(true)} className="gap-2 rounded-xl shadow-md shadow-primary/20">
              <Boxes className="h-4 w-4" />
              Restock Product Stock
            </Button>
          </div>
        </div>

        {/* High-level KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/60 bg-card rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Orders to Dispatch
              </CardTitle>
              <Truck className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${orders.length} Ready`}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Pending shipping</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Catalog Items
              </CardTitle>
              <PackageCheck className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${products.length} SKUs`}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Supplied in catalog</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Supplier Rating
              </CardTitle>
              <Sparkles className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">Verified</div>
              <p className="text-[11px] text-muted-foreground mt-1">Authorized vendor network</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Catalog Health
              </CardTitle>
              <Boxes className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">100% Active</div>
              <p className="text-[11px] text-muted-foreground mt-1">Live inventory ready</p>
            </CardContent>
          </Card>
        </div>

        {/* 2-Column Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders Ready for Dispatch */}
          <Card className="border-border/60 bg-card rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <CardHeader className="border-b border-border/40 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Truck className="h-4 w-4 text-amber-500" />
                      Pending Shipping Orders
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Client requisitions approved and authorized for delivery
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20">
                    Live Status
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Checking dispatch queue...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    All authorized orders have been dispatched. No pending shipments in queue.
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {orders.slice(0, 3).map((ord) => {
                      const next = getNextStage(ord.status);
                      const isDelivered = (ord.status || '').toUpperCase().includes('DELIVERED');

                      return (
                        <div key={ord.requestId} className="p-4 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-primary">#ORD-00{ord.requestId}</span>
                              <span className="text-xs font-bold text-foreground">{ord.productName}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Destination: {ord.departmentName || 'Enterprise'} • Qty: {ord.requestedQuantity || 1}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setTrackingId(ord.requestId);
                                setTrackingOpen(true);
                              }}
                              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                              title="View Audit Trail"
                            >
                              <History className="h-3.5 w-3.5" />
                            </Button>

                            {isDelivered ? (
                              <Badge variant="outline" className="h-8 px-2.5 text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Delivered
                              </Badge>
                            ) : next ? (
                              <Button
                                size="sm"
                                disabled={shippingId === ord.requestId}
                                onClick={() => handleShipOrder(ord.requestId, next.nextStatus)}
                                className="h-8 gap-1.5 rounded-xl text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                              >
                                {shippingId === ord.requestId ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Send className="h-3 w-3" />
                                )}
                                {next.label}
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </div>

            <div className="border-t border-border/40 p-4 bg-muted/10">
              <Link
                to="/supplier/orders"
                className="text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1.5"
              >
                View Complete Orders & Shipping Records
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>

          {/* Quick Inventory Station */}
          <Card className="border-border/60 bg-card rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <CardHeader className="border-b border-border/40 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Boxes className="h-4 w-4 text-primary" />
                      Catalog Equipment Status
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Overview of supplied equipment inventory balances fetched from backend
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    Live SKUs
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Loading catalog items...
                  </div>
                ) : products.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No products currently in catalog.
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {products.slice(0, 3).map((p) => (
                      <div key={p.productId} className="p-4 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-foreground">{p.name}</span>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            ₹{(p.price || p.pricePerProduct || 0).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          {p.status || 'AVAILABLE'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </div>

            <div className="border-t border-border/40 p-4 bg-muted/10 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRestockModalOpen(true)}
                className="h-8 text-xs rounded-xl gap-1"
              >
                <Boxes className="h-3 w-3 text-primary" />
                Restock Item
              </Button>
              <Link
                to="/supplier/inventory"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
              >
                Manage Full Inventory
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <RestockModal
        open={restockModalOpen}
        onOpenChange={setRestockModalOpen}
      />
      <TrackingModal
        open={trackingOpen}
        onOpenChange={setTrackingOpen}
        requestId={trackingId}
      />
    </div>
  );
}
