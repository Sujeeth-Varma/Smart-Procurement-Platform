import { useState, useEffect } from 'react';
import { procurementApi } from '@/api/procurement';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ShoppingCart, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface RaiseRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  preselectedProduct?: Product | null;
}

export function RaiseRequestModal({
  open,
  onOpenChange,
  onSuccess,
  preselectedProduct,
}: RaiseRequestModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      async function loadProducts() {
        setIsLoading(true);
        try {
          const list = await procurementApi.getProducts();
          setProducts(list || []);
          if (preselectedProduct) {
            setSelectedProductId(preselectedProduct.productId);
          } else if (list && list.length > 0) {
            setSelectedProductId(list[0].productId);
          }
        } catch {
          setProducts([]);
        } finally {
          setIsLoading(false);
        }
      }
      loadProducts();
    }
  }, [open, preselectedProduct]);

  const currentProduct = products.find((p) => p.productId === Number(selectedProductId));
  const unitPrice = currentProduct?.price || currentProduct?.pricePerProduct || 0;
  const totalPrice = unitPrice * (quantity > 0 ? quantity : 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }
    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    setIsSubmitting(true);
    try {
      await procurementApi.raiseRequest({
        productId: Number(selectedProductId),
        numberOfQuantities: quantity,
        description: description || `Requisition for ${quantity} unit(s) of ${currentProduct?.name || 'product'}`,
      });

      toast.success('Procurement request submitted successfully! Awaiting admin review.');
      onOpenChange(false);
      setDescription('');
      setQuantity(1);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit procurement request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border/80 bg-card p-6 shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Raise Procurement Request
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Select equipment from the active catalog and submit for administrator validation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="req-product" className="text-xs font-medium text-foreground flex items-center justify-between">
              <span>Select Product</span>
              {isLoading && <span className="text-[10px] text-muted-foreground">Loading catalog...</span>}
            </Label>
            {products.length === 0 && !isLoading ? (
              <p className="text-xs text-muted-foreground">No catalog items available.</p>
            ) : (
              <select
                id="req-product"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                className="w-full px-3 h-10 text-sm rounded-xl bg-background border border-border/70 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                required
              >
                {products.map((p) => (
                  <option key={p.productId} value={p.productId} className="bg-card text-card-foreground">
                    {p.name} - ₹{(p.price || p.pricePerProduct || 0).toLocaleString()}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="req-quantity" className="text-xs font-medium text-foreground">
                Quantity
              </Label>
              <Input
                id="req-quantity"
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="h-10 text-sm rounded-xl bg-background border-border/70"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Estimated Total
              </Label>
              <div className="h-10 px-3 rounded-xl bg-muted/40 border border-border/40 flex items-center font-mono text-sm font-bold text-foreground">
                ₹{totalPrice.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="req-desc" className="text-xs font-medium text-foreground">
              Business Justification / Remarks
            </Label>
            <textarea
              id="req-desc"
              rows={3}
              placeholder="e.g. Required for team project workstation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-background border border-border/70 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          <DialogFooter className="gap-2 pt-3 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || products.length === 0}
              className="gap-1.5 rounded-xl text-xs shadow-md shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Confirm Request
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
