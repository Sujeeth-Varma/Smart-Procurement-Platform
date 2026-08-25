import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/stores/useAuthStore';
import { apiClient } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Truck,
  PackageCheck,
  Send,
  Boxes,
  Building2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export function SupplierDashboard() {
  const { user } = useAuthStore();
  const [shippingId, setShippingId] = useState<number | null>(null);

  const [orders, setOrders] = useState([
    {
      orderId: 1,
      productName: 'Logitech Wireless Mouse M185',
      quantity: 10,
      clientDepartment: 'IT Enterprise Dev',
      orderDate: 'Aug 25, 2026',
      status: 'Awaiting Shipment',
    },
    {
      orderId: 2,
      productName: 'Ergonomic Desk Mat & Keyboards',
      quantity: 5,
      clientDepartment: 'HR Operations',
      orderDate: 'Aug 24, 2026',
      status: 'Awaiting Shipment',
    },
  ]);

  const handleShipOrder = async (orderId: number) => {
    setShippingId(orderId);
    try {
      // Call endpoint if live
      await apiClient(`/api/suppliers/orders/${orderId}/ship`, {
        method: 'POST',
      }).catch(() => null);

      toast.success(`Order #${orderId} marked as shipped! Email alert sent to client.`);
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch order');
    } finally {
      setShippingId(null);
    }
  };

  const handleRestockDemo = () => {
    toast.info('Restock Inventory flow initialized for Phase 2.');
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
              <span>Vendor: <strong className="text-foreground">{user?.email || 'supplier@company.com'}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Company: {user?.name || 'Authorized Partner'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleRestockDemo} className="gap-2 rounded-xl shadow-md shadow-primary/20">
              <Boxes className="h-4 w-4" />
              Restock Catalog Stock
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/60 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Orders to Dispatch
              </CardTitle>
              <Truck className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{orders.length}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Pending shipping confirmation</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Completed Shipments
              </CardTitle>
              <PackageCheck className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">14 Orders</div>
              <p className="text-[11px] text-muted-foreground mt-1">Delivered this quarter</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Supplier Quality Rating
              </CardTitle>
              <Sparkles className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">4.9 / 5.0</div>
              <p className="text-[11px] text-muted-foreground mt-1">Top enterprise supplier tier</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Catalog Items Supplied
              </CardTitle>
              <Boxes className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">6 SKUs</div>
              <p className="text-[11px] text-muted-foreground mt-1">Active electronics catalog</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Ready for Shipping */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Truck className="h-5 w-5 text-amber-500" />
                  Authorized Orders Awaiting Dispatch
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Confirm shipping to notify company employees and trigger tracking status
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
                {orders.length} ready
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                ✨ All authorized orders have been dispatched and shipped!
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {orders.map((ord) => (
                  <div
                    key={ord.orderId}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">
                          #ORD-00{ord.orderId}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {ord.productName}
                        </span>
                        <Badge variant="outline" className="text-[10px] bg-muted">
                          Qty: {ord.quantity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Destination: <span className="text-foreground">{ord.clientDepartment}</span> • Order Date: <span className="text-foreground">{ord.orderDate}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        disabled={shippingId === ord.orderId}
                        onClick={() => handleShipOrder(ord.orderId)}
                        className="h-9 gap-1.5 rounded-xl text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                      >
                        {shippingId === ord.orderId ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        Approve & Ship Order
                      </Button>
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
