import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Navbar } from '@/components/layout/Navbar';
import { procurementApi } from '@/api/procurement';
import { RestockModal } from '@/components/modals/RestockModal';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Boxes,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export function SupplierInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockOpen, setRestockOpen] = useState(false);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const list = await procurementApi.getProducts();
      setProducts(list || []);
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenRestock = (p: Product) => {
    setSelectedProduct(p);
    setRestockOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Header */}
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
                <Boxes className="h-5 w-5 text-primary" />
                Catalog Stock & Inventory Station
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Monitor active product inventory balances and dispatch replenishment restocks
            </p>
          </div>
        </div>

        {/* Stock Ledger */}
        <Card className="border-border/60 bg-card rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-sm font-bold text-foreground">
              Supplied Catalog SKUs ({products.length})
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Direct replenishment automatically updates the central catalog balance
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Loading inventory balances from backend...
              </div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No catalog items found in the database.
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {products.map((p) => {
                  return (
                    <div
                      key={p.productId}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                    >
                      <div className="space-y-1 max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary">
                            #SKU-0{p.productId}
                          </span>
                          <span className="text-sm font-bold text-foreground">{p.name}</span>
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                            {p.status || 'AVAILABLE'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {p.description || 'Approved corporate hardware item.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/30">
                        <div className="text-left sm:text-right mr-2">
                          <div className="font-mono text-sm font-bold text-foreground">
                            ₹{(p.price || p.pricePerProduct || 0).toLocaleString()}
                          </div>
                          <span className="text-[10px] text-muted-foreground">Unit Price</span>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleOpenRestock(p)}
                          className="h-8 gap-1.5 rounded-xl text-xs shadow-sm"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Restock Stock
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <RestockModal
        open={restockOpen}
        onOpenChange={setRestockOpen}
        productId={selectedProduct?.productId}
        productName={selectedProduct?.name}
        onSuccess={loadProducts}
      />
    </div>
  );
}
