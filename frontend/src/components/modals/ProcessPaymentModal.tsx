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
import { CreditCard, Loader2, ShieldCheck, ArrowRight, Sparkles, Building, Box, QrCode, Smartphone, Copy, Check } from 'lucide-react';
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
  const [paymentMode, setPaymentMode] = useState<'CARD' | 'UPI'>('CARD');
  
  // Card details state (prefilled with demo creds)
  const [cardNumber, setCardNumber] = useState('4111222233334444');
  const [cardHolderName, setCardHolderName] = useState('Single System Administrator');
  const [expiryDate, setExpiryDate] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [remarks, setRemarks] = useState('Payment transferred to Supplier bank account');

  // UPI details state
  const [copiedUpi, setCopiedUpi] = useState(false);
  const upiVpa = 'admin.procurement@icici';

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

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiVpa);
    setCopiedUpi(true);
    toast.success('Admin UPI VPA copied to clipboard!');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (paymentMode === 'CARD') {
        await adminApi.processPayment({
          requestId,
          supplierId: Number(supplierId),
          cardNumber,
          cardHolderName,
          expiryDate,
          cvv,
          remarks: remarks || 'Credit/Debit Card payment processed',
        });
      } else {
        // UPI Payment mode (maps to backend dummy payment seamlessly)
        await adminApi.processPayment({
          requestId,
          supplierId: Number(supplierId),
          cardNumber: '4111222233334444',
          cardHolderName: 'Admin UPI Corporate Account',
          expiryDate: '12/28',
          cvv: '123',
          remarks: remarks && remarks !== 'Payment transferred to Supplier bank account'
            ? remarks
            : `UPI Payment scanned & verified (Admin Account Debited)`,
        });
      }

      toast.success(
        `Payment of ₹${amount.toLocaleString()} processed via ${
          paymentMode === 'CARD' ? 'Credit/Debit Card' : 'UPI QR Code'
        } for ${productName || `Order #${requestId}`}! Dispatched to supplier.`
      );
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Payment gateway failed to process transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `upi://pay?pa=${upiVpa}&pn=CorporateProcurement&am=${amount}&cu=INR`
  )}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border/80 bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {paymentMode === 'CARD' ? (
                <CreditCard className="h-5 w-5" />
              ) : (
                <QrCode className="h-5 w-5" />
              )}
            </div>
            {paymentMode === 'CARD' && (
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
            )}
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

        {/* Beneficiary Supplier Selection */}
        <div className="space-y-1.5 pt-1">
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
              className="w-full px-3 h-9 text-xs rounded-xl bg-background border border-border/70 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {suppliers.map((s) => (
                <option key={s.supplierId} value={s.supplierId} className="bg-card text-card-foreground">
                  {s.name} ({s.bankName || 'Verified Account'})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Payment Mode Selector Tabs */}
        <div className="space-y-1.5 pt-1">
          <Label className="text-xs font-medium text-foreground">Select Payment Mode</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMode('CARD')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                paymentMode === 'CARD'
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-border/60 bg-background text-muted-foreground hover:bg-muted/40'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Credit / Debit Card
            </button>
            <button
              type="button"
              onClick={() => setPaymentMode('UPI')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                paymentMode === 'UPI'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-sm'
                  : 'border-border/60 bg-background text-muted-foreground hover:bg-muted/40'
              }`}
            >
              <QrCode className="h-4 w-4" />
              UPI / QR Code
            </button>
          </div>
        </div>

        <form onSubmit={handleProcess} className="space-y-3.5 pt-1">
          {paymentMode === 'CARD' ? (
            <>
              {/* Credit / Debit Card Form */}
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
            </>
          ) : (
            <>
              {/* UPI QR Code Section */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/20 border border-emerald-500/20 space-y-3 text-center">
                <div className="flex items-center justify-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/20">
                  <Smartphone className="h-3.5 w-3.5" />
                  Instant Scan & Pay via UPI
                </div>

                {/* QR Code Container */}
                <div className="relative p-3 bg-white rounded-2xl border-2 border-emerald-500/30 shadow-md">
                  <img
                    src={qrCodeUrl}
                    alt="UPI QR Code"
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                </div>

                {/* UPI VPA Copy Section */}
                <div className="w-full flex items-center justify-between p-2 rounded-xl bg-background border border-border/60 text-xs">
                  <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[200px]">
                    UPI ID: <strong className="text-foreground">{upiVpa}</strong>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyUpi}
                    className="h-7 px-2 text-[11px] gap-1 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 rounded-lg"
                  >
                    {copiedUpi ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedUpi ? 'Copied' : 'Copy'}
                  </Button>
                </div>

                {/* Supported Apps Logos/Text */}
                <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-2">
                  <span>Supported Apps:</span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-background">GPay</Badge>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-background">PhonePe</Badge>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-background">Paytm</Badge>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-background">BHIM</Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pay-remarks-upi" className="text-xs font-medium text-foreground">
                  Payment Reference / Remarks
                </Label>
                <Input
                  id="pay-remarks-upi"
                  value={remarks === 'Payment transferred to Supplier bank account' ? 'UPI QR scanned & disbursed via Admin Account' : remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="h-9 text-xs rounded-xl bg-background border-border/70"
                />
              </div>
            </>
          )}

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
              className="gap-1.5 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Processing {paymentMode === 'UPI' ? 'UPI Payment...' : 'Card Payment...'}
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {paymentMode === 'UPI'
                    ? `Pay ₹${amount.toLocaleString()} (Debit Admin Account)`
                    : `Disburse ₹${amount.toLocaleString()}`}
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
