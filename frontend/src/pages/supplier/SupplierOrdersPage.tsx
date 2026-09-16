import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Navbar } from '@/components/layout/Navbar';
import { supplierApi } from '@/api/supplier';
import { TrackingModal } from '@/components/modals/TrackingModal';
import type { ProcurementRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Truck,
  Send,
  ArrowLeft,
  CheckCircle2,
  PackageCheck,
  Package,
  Loader2,
  History,
} from 'lucide-react';
import { toast } from 'sonner';

export function SupplierOrdersPage() {
  const [orders, setOrders] = useState<ProcurementRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [trackingId, setTrackingId] = useState<number | null>(null);
  const [trackingOpen, setTrackingOpen] = useState(false);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const list = await supplierApi.getSupplierOrders();
      setOrders(list || []);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getNextStage = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s.includes('DELIVERED')) return null;
    if (s.includes('OUT_FOR_DELIVERY')) {
      return {
        nextStatus: 'DELIVERED' as const,
        label: 'Confirm Delivered',
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      };
    }
    if (s.includes('DISPATCHED') || s.includes('SHIPPED')) {
      return {
        nextStatus: 'OUT_FOR_DELIVERY' as const,
        label: 'Mark Out for Delivery',
        icon: <Truck className="h-3.5 w-3.5" />,
      };
    }
    if (s.includes('ORDER_PACKED')) {
      return {
        nextStatus: 'ORDER_DISPATCHED' as const,
        label: 'Dispatch to Logistics',
        icon: <Send className="h-3.5 w-3.5" />,
      };
    }
    if (s.includes('ORDER_RECEIVED')) {
      return {
        nextStatus: 'ORDER_PACKED' as const,
        label: 'Pack & QA Order',
        icon: <PackageCheck className="h-3.5 w-3.5" />,
      };
    }
    return {
      nextStatus: 'ORDER_RECEIVED' as const,
      label: 'Acknowledge Order',
      icon: <Package className="h-3.5 w-3.5" />,
    };
  };

  const handleUpdateStatus = async (requestId: number, nextStatus: any, stageLabel: string) => {
    setUpdatingId(requestId);
    try {
      await supplierApi.updateOrderStatus(requestId, nextStatus, `Supplier action: ${stageLabel}`);
      toast.success(`Order #${requestId} updated to ${nextStatus}!`);
      setOrders((prev) =>
        prev.map((o) => (o.requestId === requestId ? { ...o, status: nextStatus } : o))
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s.includes('DELIVERED')) {
      return (
        <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
          <CheckCircle2 className="h-3 w-3" />
          Delivered
        </Badge>
      );
    }
    if (s.includes('OUT_FOR_DELIVERY')) {
      return (
        <Badge variant="outline" className="gap-1 bg-primary/10 text-primary border-primary/20 text-xs">
          <Truck className="h-3 w-3" />
          Out for Delivery
        </Badge>
      );
    }
    if (s.includes('DISPATCHED') || s.includes('SHIPPED')) {
      return (
        <Badge variant="outline" className="gap-1 bg-primary/10 text-primary border-primary/20 text-xs">
          <PackageCheck className="h-3 w-3" />
          In Transit / Dispatched
        </Badge>
      );
    }
    if (s.includes('ORDER_PACKED')) {
      return (
        <Badge variant="outline" className="gap-1 bg-cyan-500/10 text-cyan-500 border-cyan-500/20 text-xs">
          <PackageCheck className="h-3 w-3" />
          Packed & Ready
        </Badge>
      );
    }
    if (s.includes('ORDER_RECEIVED')) {
      return (
        <Badge variant="outline" className="gap-1 bg-blue-500/10 text-blue-500 border-blue-500/20 text-xs">
          <Package className="h-3 w-3" />
          Acknowledged
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">
        <Truck className="h-3 w-3" />
        {status || 'Awaiting Shipment'}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link to="/supplier/dashboard">
                <Button variant="ghost" size="sm" className="h-8 gap-1 pl-1 text-xs text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Dashboard
                </Button>
              </Link>
              <span className="text-muted-foreground">/</span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Truck className="h-5 w-5 text-amber-500" />
                Supplier Order Dispatch & Fulfillment
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Progressively advance orders through fulfillment milestones (Acknowledged → Packed → Dispatched → Delivered)
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <Card className="border-border/60 bg-card rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-sm font-bold text-foreground">
              Fulfillment Queue ({orders.length})
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Each stage can be advanced once in sequence until fully delivered
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Loading orders from backend...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No orders requiring shipment in the dispatch queue.
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {orders.map((ord) => {
                  const nextStage = getNextStage(ord.status);
                  const isDelivered = (ord.status || '').toUpperCase().includes('DELIVERED');

                  return (
                    <div
                      key={ord.requestId}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary">
                            #ORD-00{ord.requestId}
                          </span>
                          <span className="text-sm font-bold text-foreground">
                            {ord.productName || `Product #${ord.productId}`}
                          </span>
                          <Badge variant="outline" className="text-[10px] bg-muted">
                            Qty: {ord.requestedQuantity || ord.quantity || 1}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          User: {ord.userEmail} {ord.departmentName ? `• Dept: ${ord.departmentName}` : ''}
                        </p>
                        {ord.createdDate && (
                          <div className="text-[11px] text-muted-foreground">
                            Order Date: <span className="text-foreground font-mono">{ord.createdDate}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/30">
                        <div className="mr-1">{getStatusBadge(ord.status)}</div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setTrackingId(ord.requestId);
                            setTrackingOpen(true);
                          }}
                          className="h-8 gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground border-border/60 rounded-xl"
                          title="View Audit Trail"
                        >
                          <History className="h-3.5 w-3.5" />
                          Audit Trail
                        </Button>

                        {isDelivered ? (
                          <Badge variant="outline" className="h-8 px-3 text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Finalized
                          </Badge>
                        ) : nextStage ? (
                          <Button
                            size="sm"
                            disabled={updatingId === ord.requestId}
                            onClick={() => handleUpdateStatus(ord.requestId, nextStage.nextStatus, nextStage.label)}
                            className="h-8 gap-1.5 rounded-xl text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                          >
                            {updatingId === ord.requestId ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              nextStage.icon
                            )}
                            {nextStage.label}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
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
    </div>
  );
}
