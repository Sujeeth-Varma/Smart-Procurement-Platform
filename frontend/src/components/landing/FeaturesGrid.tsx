import { motion } from 'motion/react';
import {
  Boxes,
  ShieldCheck,
  CreditCard,
  History,
  Users,
  BellRing,
} from 'lucide-react';

const features = [
  {
    icon: Boxes,
    title: 'Dynamic Product Catalog',
    description:
      'Categorized product directory with live quantity balances and direct request-raising capabilities.',
    badge: 'Inventory Core',
  },
  {
    icon: ShieldCheck,
    title: 'Atomic Approval Pipeline',
    description:
      'Single-admin decision engine with instant inventory deduction and strict state machine transitions.',
    badge: 'Zero Race Conditions',
  },
  {
    icon: CreditCard,
    title: 'Supplier Payment Gateway',
    description:
      'Direct credit card and bank transfer settlement with automated receipt generation and remarks audit.',
    badge: 'Direct Settlement',
  },
  {
    icon: History,
    title: 'Immutable Audit Trails',
    description:
      'Step-by-step audit logging on every approval, status transition, payment, and supplier dispatch event.',
    badge: 'Compliance Ready',
  },
  {
    icon: Users,
    title: 'Multi-Department RBAC',
    description:
      'Role-based access control segregating regular employees, department managers, admin, and suppliers.',
    badge: 'Enterprise Security',
  },
  {
    icon: BellRing,
    title: 'Automated HTML Email Alerts',
    description:
      'Responsive email notifications dispatched on request approval, rejection, and shipment stages.',
    badge: 'Real-time Comms',
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 border-t border-border/40 bg-muted/20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">
            Engineered for Precision
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Complete Control Across the Procurement Lifecycle
          </p>
          <p className="text-sm text-muted-foreground">
            Built on a high-throughput Spring Boot 4 REST backbone, designed to simplify employee requisitions and vendor operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 shadow-sm duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/50 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/40">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
