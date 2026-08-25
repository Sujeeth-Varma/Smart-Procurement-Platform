import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Navbar } from '@/components/layout/Navbar';
import { procurementApi } from '@/api/procurement';
import { RaiseRequestModal } from '@/components/modals/RaiseRequestModal';
import type { Category, Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Boxes,
  ArrowLeft,
  Search,
  ShoppingCart,
  Loader2,
  CheckCircle2,
  Star,
} from 'lucide-react';

export function UserCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ratings, setRatings] = useState<Record<number, { averageRating: number; totalReviews: number }>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [raiseModalOpen, setRaiseModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [prodList, catList] = await Promise.all([
          procurementApi.getProducts().catch(() => []),
          procurementApi.getCategories().catch(() => []),
        ]);
        setProducts(prodList || []);
        setCategories(catList || []);

        // Load rating summaries in parallel
        if (prodList && prodList.length > 0) {
          const ratingEntries = await Promise.all(
            prodList.map(async (p) => {
              try {
                const summary = await procurementApi.getProductRatingSummary(p.productId);
                return [p.productId, { averageRating: summary.averageRating, totalReviews: summary.totalReviews }] as const;
              } catch {
                return [p.productId, { averageRating: 5.0, totalReviews: 0 }] as const;
              }
            })
          );
          setRatings(Object.fromEntries(ratingEntries));
        }
      } catch {
        setProducts([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCat =
      selectedCategory === 'ALL' ||
      p.category?.categoryName === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleOrder = (product: Product) => {
    setSelectedProductForModal(product);
    setRaiseModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
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
                <Boxes className="h-5 w-5 text-primary" />
                Equipment & Hardware Catalog
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Browse approved corporate catalog items, verified supplier equipment, and user ratings
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search equipment by name or specs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-background border-border/70"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Button
              variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('ALL')}
              className="h-8 text-xs rounded-lg"
            >
              All Items ({products.length})
            </Button>
            {categories.map((c) => (
              <Button
                key={c.categoryId}
                variant={selectedCategory === c.categoryName ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(c.categoryName)}
                className="h-8 text-xs rounded-lg"
              >
                {c.categoryName}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Loading catalog from backend...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground bg-muted/20 rounded-2xl border border-border/40">
            No products found matching the criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => {
              const ratingData = ratings[p.productId];
              return (
                <div
                  key={p.productId}
                  className="rounded-2xl border border-border/60 bg-card p-5 space-y-4 shadow-sm duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground line-clamp-1">
                        {p.name}
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                        {p.status || 'AVAILABLE'}
                      </Badge>
                    </div>

                    {ratingData && ratingData.totalReviews > 0 && (
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{ratingData.averageRating.toFixed(1)}</span>
                        <span className="text-muted-foreground text-[10px]">({ratingData.totalReviews} reviews)</span>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {p.description || 'Approved organizational equipment item with supplier warranty.'}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-border/40">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">Unit Price</span>
                      <span className="font-mono text-sm font-bold text-foreground">
                        ₹{(p.price || p.pricePerProduct || 0).toLocaleString()}
                      </span>
                    </div>

                    <Button
                      onClick={() => handleOrder(p)}
                      className="w-full h-9 rounded-xl text-xs gap-1.5 shadow-sm"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Request Requisition
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <RaiseRequestModal
        open={raiseModalOpen}
        onOpenChange={setRaiseModalOpen}
        preselectedProduct={selectedProductForModal}
      />
    </div>
  );
}
