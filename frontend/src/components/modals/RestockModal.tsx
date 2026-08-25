import { useState } from 'react';
import { supplierApi } from '@/api/supplier';
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
import { Boxes, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface RestockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: number;
  productName?: string;
  onSuccess?: () => void;
}

export function RestockModal({
  open,
  onOpenChange,
  productId = 1,
  productName = 'Wireless Mouse',
  onSuccess,
}: RestockModalProps) {
  const [quantity, setQuantity] = useState(25);
  const [remarks, setRemarks] = useState('Authorized supplier inventory shipment replenishment');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await supplierApi.restockProduct(productId, quantity, remarks);
      toast.success(`Successfully restocked ${quantity} units of ${productName}!`);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to restock product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border/80 bg-card p-6 shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Boxes className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Restock Inventory Catalog
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Add inventory stock for {productName} (ID #{productId})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRestock} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="restock-qty" className="text-xs font-medium text-foreground">
              Quantity to Add
            </Label>
            <Input
              id="restock-qty"
              type="number"
              min="1"
              max="500"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="h-10 text-sm font-mono rounded-xl bg-background border-border/70"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="restock-remarks" className="text-xs font-medium text-foreground">
              Shipment Batch Notes / Remarks
            </Label>
            <textarea
              id="restock-remarks"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-background border border-border/70 text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              required
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
              disabled={isSubmitting}
              className="gap-1.5 rounded-xl text-xs shadow-md shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating Stock...
                </>
              ) : (
                <>
                  Confirm Restock
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
