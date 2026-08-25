import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/stores/useAuthStore';
import { apiClient } from '@/api/client';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Building,
  Sparkles,
  ShoppingBag,
  Loader2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export function UserDashboard() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        const data = await apiClient<Product[]>('/api/products');
        setProducts(data || []);
      } catch (err: any) {
        // Mock fallback if backend offline
        setProducts([
          { productId: 1, name: 'Wireless Mouse', price: 800, numberOfQuantities: 45, description: 'Ergonomic 2.4GHz optical mouse' },
          { productId: 2, name: 'Ergonomic Office Chair', price: 8500, numberOfQuantities: 12, description: 'High-back mesh chair with lumbar support' },
          { productId: 3, name: '4K Monitor 27-inch', price: 24999, numberOfQuantities: 8, description: 'IPS UHD display with USB-C hub' },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleRaiseQuickDemo = () => {
    toast.info('Procurement Request Modal initialized for Phase 2 workflow.');
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
                Employee Workspace
              </h1>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                USER / EMPLOYEE
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
              <span>Logged in as <strong className="text-foreground">{user?.email || 'user@company.com'}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-muted-foreground" />
                Department: {user?.department?.departmentName || 'Enterprise'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleRaiseQuickDemo} className="gap-2 rounded-xl shadow-md shadow-primary/20">
              <Plus className="h-4 w-4" />
              Raise Procurement Request
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/60 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                My Total Requests
              </CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">4</div>
              <p className="text-[11px] text-muted-foreground mt-1">Across all departments</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pending Approvals
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">1</div>
              <p className="text-[11px] text-muted-foreground mt-1">Awaiting admin review</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Approved Orders
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">2</div>
              <p className="text-[11px] text-muted-foreground mt-1">Inventory stock deducted</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Rejected / Closed
              </CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">1</div>
              <p className="text-[11px] text-muted-foreground mt-1">Closed requisitions</p>
            </CardContent>
          </Card>
        </div>

        {/* Catalog Products Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Available Catalog Products
              </h2>
              <p className="text-xs text-muted-foreground">
                Items currently in stock and eligible for procurement requisitions
              </p>
            </div>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <motion.div key={p.productId} whileHover={{ y: -3 }} className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-5 space-y-3 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{p.name}</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      In Stock: {p.numberOfQuantities ?? 10}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {p.description || 'Enterprise approved hardware equipment.'}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-border/40 pt-3">
                  <span className="font-mono text-sm font-bold text-foreground">
                    ₹{p.price || p.pricePerProduct || 800}
                  </span>
                  <Button size="sm" variant="outline" onClick={handleRaiseQuickDemo} className="h-8 text-xs rounded-lg gap-1">
                    <Sparkles className="h-3 w-3 text-primary" />
                    Request Item
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
