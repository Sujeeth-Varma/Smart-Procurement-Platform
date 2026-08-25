import { useState, useEffect } from 'react';
import { adminApi } from '@/api/admin';
import type { Supplier } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreditCard, Loader2, ShieldCheck, ArrowRight, Sparkles, Building, Box } from 'lucide-react';
import { toast } from 'sonner';

interface ProcessPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId?: number;
  productName?: string;
  requestedQuantity?: number;
  userName?: string;
  departmentName?: string;
  amount?: number;
  onSuccess?: () => void;
}

export function ProcessPaymentModal({
  open,
  onOpenChange,
  requestId = 1,
  productName,
  requestedQuantity,
  userName,
  departmentName,
  amount = 1000,
  onSuccess,
}: ProcessPaymentModalProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState<number>(1);
  const [cardNumber, setCardNumber] = useState('4111222233334444');
  const [cardHolderName, setCardHolderName] = useState('Single System Administrator');
  const [expiryDate, setExpiryDate] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [remarks, setRemarks] = useState('Payment transferred to Supplier bank account');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      async function loadSuppliers() {
        try {
          const list = await adminApi.getSuppliers();
          setSuppliers(list || []);
          if (list && list.length > 0) {
            setSupplierId(list[0].supplierId);
          }
        } catch {
          setSuppliers([]);
        }
      }
      loadSuppliers();
    }
  }, [open]);

  const handleFillDemoCreds = () => {
    setCardNumber('4111222233334444');
    setCardHolderName('Single System Administrator');
    setExpiryDate('12/28');
    setCvv('123');
    setRemarks('Payment transferred to Supplier bank account');
    if (suppliers.length > 0) {
      setSupplierId(suppliers[0].supplierId);
    }
    toast.info('Demo payment card details populated successfully!');
  };

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await adminApi.processPayment({
        requestId,
        supplierId: Number(supplierId),
        cardNumber,
        cardHolderName,
        expiryDate,
        cvv,
        remarks,
      });

      toast.success(
        `Payment of ₹${amount.toLocaleString()} processed successfully for ${productName || `Order #${requestId}`}! Dispatched to supplier.`
      );
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Payment gateway failed to process transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border/80 bg-card p-6 shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillDemoCreds}
              className="h-8 px-2.5 gap-1.5 rounded-xl text-xs border-primary/40 text-primary hover:bg-primary/10 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Autofill Demo Card Details
            </Button>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Supplier Payment Gateway
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Disburse approved corporate payment to authorized supplier bank account
          </DialogDescription>
        </DialogHeader>

        {/* Product & Order Details Card */}
        <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Box className="h-4 w-4 text-primary" />
              <span>{productName || `Request #${requestId}`}</span>
              {requestedQuantity && (
                <Badge variant="outline" className="text-[10px] bg-muted px-1.5 py-0">
                  Qty: {requestedQuantity}
                </Badge>
              )}
            </div>
            <span className="font-mono text-sm font-bold text-emerald-500">
              ₹{amount.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="font-mono">Order #{requestId}</span>
            {userName && (
              <>
                <span>•</span>
                <span>User: {userName}</span>
              </>
            )}
            {departmentName && (
              <>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Building className="h-3 w-3" />
                  {departmentName}
                </span>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleProcess} className="space-y-3.5 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="pay-supplier" className="text-xs font-medium text-foreground">
              Beneficiary Supplier
            </Label>
            {suppliers.length === 0 ? (
              <p className="text-xs text-muted-foreground">No suppliers found.</p>
            ) : (
              <select
                id="pay-supplier"
                value={supplierId}
                onChange={(e) => setSupplierId(Number(e.target.value))}
                className="w-full px-3 h-10 text-sm rounded-xl bg-background border border-border/70 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {suppliers.map((s) => (
                  <option key={s.supplierId} value={s.supplierId} className="bg-card text-card-foreground">
                    {s.name} ({s.bankName || 'Verified Account'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-cardnum" className="text-xs font-medium text-foreground">
              Corporate Card Number
            </Label>
            <Input
              id="pay-cardnum"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="h-9 text-sm font-mono rounded-xl bg-background border-border/70"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-cardholder" className="text-xs font-medium text-foreground">
              Cardholder Name
            </Label>
            <Input
              id="pay-cardholder"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              className="h-9 text-xs rounded-xl bg-background border-border/70"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pay-exp" className="text-xs font-medium text-foreground">
                Expiry Date
              </Label>
              <Input
                id="pay-exp"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="h-9 text-xs font-mono rounded-xl bg-background border-border/70"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-cvv" className="text-xs font-medium text-foreground">
                CVV
              </Label>
              <Input
                id="pay-cvv"
                type="password"
                maxLength={4}
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="h-9 text-xs font-mono rounded-xl bg-background border-border/70"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-remarks" className="text-xs font-medium text-foreground">
              Payment Remarks
            </Label>
            <Input
              id="pay-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="h-9 text-xs rounded-xl bg-background border-border/70"
              required
            />
          </div>

          <DialogFooter className="gap-2 pt-2 sm:space-x-0">
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
              disabled={isProcessing || suppliers.length === 0}
              className="gap-1.5 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Disburse ₹{amount.toLocaleString()}
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
