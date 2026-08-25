import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { WorkflowSection } from '@/components/landing/WorkflowSection';

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesGrid />
        <WorkflowSection />
      </main>
      <Footer />
    </div>
  );
}
