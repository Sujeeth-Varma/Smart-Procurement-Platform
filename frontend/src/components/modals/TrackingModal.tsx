import { useState, useEffect } from 'react';
import { procurementApi } from '@/api/procurement';
import type { RequestTrackingRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  History,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Truck,
  CreditCard,
  Package,
  PackageCheck,
  UserCheck,
} from 'lucide-react';

interface TrackingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: number | null;
  productName?: string;
}

export function TrackingModal({
  open,
  onOpenChange,
  requestId,
  productName,
}: TrackingModalProps) {
  const [history, setHistory] = useState<RequestTrackingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && requestId) {
      async function loadTracking() {
        setIsLoading(true);
        try {
          const list = await procurementApi.getRequestTracking(requestId!);
          setHistory(list || []);
        } catch {
          setHistory([]);
        } finally {
          setIsLoading(false);
        }
      }
      loadTracking();
    }
  }, [open, requestId]);

  const getStageConfig = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s.includes('DELIVERED')) {
      return {
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        title: 'Delivered & Received',
      };
    }
    if (s.includes('OUT_FOR_DELIVERY')) {
      return {
        icon: <Truck className="h-4 w-4 text-primary" />,
        badgeClass: 'bg-primary/10 text-primary border-primary/20',
        title: 'Out for Delivery',
      };
    }
    if (s.includes('DISPATCHED') || s.includes('SHIPPED')) {
      return {
        icon: <Truck className="h-4 w-4 text-primary" />,
        badgeClass: 'bg-primary/10 text-primary border-primary/20',
        title: 'Dispatched to Logistics',
      };
    }
    if (s.includes('ORDER_PACKED')) {
      return {
        icon: <PackageCheck className="h-4 w-4 text-cyan-500" />,
        badgeClass: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
        title: 'Order Packed & Ready',
      };
    }
    if (s.includes('ORDER_RECEIVED')) {
      return {
        icon: <Package className="h-4 w-4 text-blue-500" />,
        badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        title: 'Supplier Order Acknowledged',
      };
    }
    if (s.includes('PAYMENT_COMPLETED')) {
      return {
        icon: <CreditCard className="h-4 w-4 text-emerald-500" />,
        badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        title: 'Supplier Payment Settled',
      };
    }
    if (s.includes('APPROVED')) {
      return {
        icon: <UserCheck className="h-4 w-4 text-emerald-500" />,
        badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        title: 'Approved by Admin',
      };
    }
    if (s.includes('CLOSED') || s.includes('REJECTED')) {
      return {
        icon: <XCircle className="h-4 w-4 text-destructive" />,
        badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
        title: 'Rejected / Closed',
      };
    }
    return {
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      title: 'Pending Admin Approval',
    };
  };

  const formatTimestamp = (ts?: string) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      return isNaN(d.getTime()) ? ts : d.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-border/80 bg-card p-6 shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <History className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Audit Tracking & Delivery Timeline
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Requisition #{requestId} {productName ? `• ${productName}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 max-h-[60vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-xs">Fetching live audit trail from backend...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground">
                No audit tracking records recorded yet for Request #{requestId}.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
              {history.map((rec, index) => {
                const config = getStageConfig(rec.status);
                const performer = rec.actionBy?.name || rec.actionByName;
                const role = rec.actionBy?.role || rec.actionBy?.designation;

                return (
                  <div key={rec.trackingId || index} className="relative space-y-1.5">
                    <div className="absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-card ring-2 ring-background">
                      {config.icon}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {config.title}
                        </span>
                        <Badge variant="outline" className={`text-[10px] ${config.badgeClass}`}>
                          {rec.status}
                        </Badge>
                      </div>

                      {rec.actionTimestamp && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatTimestamp(rec.actionTimestamp)}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-foreground/90 leading-relaxed font-normal bg-muted/20 p-2.5 rounded-xl border border-border/40">
                      {rec.remarks}
                    </p>

                    {performer && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
                        <span>Action by:</span>
                        <strong className="text-foreground">{performer}</strong>
                        {role && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 bg-muted">
                            {role}
                          </Badge>
                        )}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
