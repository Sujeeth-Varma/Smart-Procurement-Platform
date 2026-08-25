import { Boxes, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm py-12 text-sm text-muted-foreground transition-colors">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Boxes className="h-4 w-4" />
              </div>
              <span className="font-bold text-foreground text-base tracking-tight">
                ProcureFlow AI
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              Next-generation enterprise procurement platform featuring automated employee request routing, real-time single-admin stock validation, and integrated supplier payment gateways.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium pt-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational • Spring Boot REST Core
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">
              Platform Roles
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-foreground transition-colors">
                  Employee Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-foreground transition-colors">
                  Single Admin Control
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-foreground transition-colors">
                  Supplier Hub
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-foreground transition-colors">
                  New Employee Registration
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">
              Enterprise Specs
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Stateless JWT Security
              </li>
              <li>MySQL 8.0 Persistence</li>
              <li>Audit Trail Tracking</li>
              <li>Spring Security 6 RBAC</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Enterprise Procurement System. All rights reserved.</p>
          <div className="flex items-center gap-1 text-muted-foreground">
            Built with modern React 19 & Tailwind CSS
          </div>
        </div>
      </div>
    </footer>
  );
}
