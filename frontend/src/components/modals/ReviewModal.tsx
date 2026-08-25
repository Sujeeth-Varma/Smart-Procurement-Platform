import { useState } from 'react';
import { procurementApi } from '@/api/procurement';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Star, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: number | null;
  productName?: string;
  onSuccess?: () => void;
}

export function ReviewModal({
  open,
  onOpenChange,
  requestId,
  productName,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId) return;

    setIsSubmitting(true);
    try {
      await procurementApi.submitReview({
        requestId,
        rating,
        comment: comment || 'Verified equipment delivered in excellent operational condition.',
      });

      toast.success('Product review submitted successfully! Thank you for your feedback.');
      onOpenChange(false);
      setComment('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border/80 bg-card p-6 shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Rate & Review Equipment
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Requisition #{requestId} {productName ? `• ${productName}` : ''}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2 text-center py-2">
            <Label className="text-xs font-medium text-foreground block">
              Overall Product Rating
            </Label>
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-muted-foreground hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-7 w-7 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/40'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">
              {rating === 5 ? '5 Stars - Excellent' : rating === 4 ? '4 Stars - Good' : rating === 3 ? '3 Stars - Average' : 'Needs Improvement'}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rev-comment" className="text-xs font-medium text-foreground">
              Feedback & Performance Notes
            </Label>
            <textarea
              id="rev-comment"
              rows={3}
              placeholder="How is the hardware performance and delivery packaging?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-background border border-border/70 text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
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
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Submit Rating
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
