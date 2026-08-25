import { motion } from 'motion/react';
import { ArrowRight, FileCheck, ShoppingCart, Truck, CheckCircle } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: ShoppingCart,
    title: 'Employee Requisition',
    desc: 'Employee selects catalog equipment, specifies quantities, and submits request with department metadata.',
  },
  {
    step: '02',
    icon: FileCheck,
    title: 'Admin Stock Validation',
    desc: 'Single Admin reviews pending requests. Approval executes stock check, deducts inventory, and sends email alerts.',
  },
  {
    step: '03',
    icon: CheckCircle,
    title: 'Payment Settlement',
    desc: 'Direct payment processing through supplier gateway with transaction receipt generation and ledger audit.',
  },
  {
    step: '04',
    icon: Truck,
    title: 'Supplier Dispatch & Delivery',
    desc: 'Authorized supplier receives order, marks status as shipped, and triggers real-time tracking updates.',
  },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="py-20 border-t border-border/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">
            End-to-End Workflow
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            From Request to Delivery in 4 Fluid Steps
          </p>
          <p className="text-sm text-muted-foreground">
            Guaranteed state consistency with zero re-approvals or orphan requisitions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-6 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-2xl font-black text-muted-foreground/30">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground/40">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
