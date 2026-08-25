import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Boxes,
  Lock,
  TrendingUp,
} from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Top Announcement Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant="outline"
              className="gap-2 px-3.5 py-1.5 rounded-full border-border/80 bg-background/60 backdrop-blur-md text-xs font-medium shadow-sm hover:border-primary/50 transition-colors cursor-default"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>Next-Gen Enterprise Procurement v2.0</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-primary font-semibold">Live System</span>
            </Badge>
          </motion.div>

          {/* Main Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl leading-[1.12]"
          >
            Procurement Intelligence for{' '}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-accent-foreground bg-clip-text text-transparent">
              Modern Enterprises
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed"
          >
            Empower employees to request equipment in seconds. Single-click administrator approval workflows with automated catalog inventory validation and direct supplier dispatch.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full justify-center"
          >
            <Link to="/login" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" className="w-full sm:w-auto gap-2 px-6 rounded-xl shadow-lg shadow-primary/25 h-12 text-sm font-semibold">
                  Access Portal
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            <Link to="/register" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto gap-2 px-6 rounded-xl border-border/80 bg-background/50 backdrop-blur-md h-12 text-sm font-semibold hover:bg-muted"
              >
                Register as Employee
              </Button>
            </Link>
          </motion.div>

          {/* Value Props Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 text-xs text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Real-Time Stock Checks</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              <span>Single Admin Governance</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Direct Supplier Gateway</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary shrink-0" />
              <span>Stateless JWT Security</span>
            </div>
          </motion.div>

          {/* Interactive UI Mockup Card Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full max-w-4xl mt-12 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-4 sm:p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-amber-400/60" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
                <span className="text-xs text-muted-foreground ml-2 font-mono">
                  procureflow-control-center.internal
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                  Role: Dynamic RBAC
                </Badge>
              </div>
            </div>

            {/* Dashboard Sample Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {/* Box 1: Employee View */}
              <div className="rounded-xl border border-border/50 bg-background/50 p-4 space-y-2 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Boxes className="h-3.5 w-3.5 text-primary" />
                    Employee Catalog
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-medium">
                    Active Stock
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Browse products, verify inventory stock, and raise orders with instant department linkage.
                </p>
                <div className="text-[11px] font-mono text-muted-foreground pt-1 flex items-center justify-between">
                  <span>Wireless Mouse</span>
                  <span className="text-foreground font-semibold">₹800.00</span>
                </div>
              </div>

              {/* Box 2: Admin Command */}
              <div className="rounded-xl border border-border/50 bg-background/50 p-4 space-y-2 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    Admin Approvals
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-medium">
                    Stock Guards
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Atomic inventory deduction upon approval. Prevents re-approval and enforces audit records.
                </p>
                <div className="text-[11px] font-mono text-muted-foreground pt-1 flex items-center justify-between">
                  <span>Status: PENDING</span>
                  <span className="text-emerald-500 font-semibold">One-Click Approve</span>
                </div>
              </div>

              {/* Box 3: Supplier Hub */}
              <div className="rounded-xl border border-border/50 bg-background/50 p-4 space-y-2 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                    Supplier Dispatch
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                    Fulfillment
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Automated order routing to designated suppliers with shipping notifications and payment reconciliation.
                </p>
                <div className="text-[11px] font-mono text-muted-foreground pt-1 flex items-center justify-between">
                  <span>Shipment Status</span>
                  <span className="text-primary font-semibold">Dispatched</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
