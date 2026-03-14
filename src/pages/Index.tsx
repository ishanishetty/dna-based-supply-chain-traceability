import { useState } from 'react';
import { CreateProductForm } from '@/components/CreateProductForm';
import { ProductSelector } from '@/components/ProductSelector';
import { ProductOverview } from '@/components/ProductOverview';
import { EventLogger } from '@/components/EventLogger';
import { DNATimeline } from '@/components/DNATimeline';
import { DNAHelix } from '@/components/DNASequence';
import { Dna, Activity, Shield } from 'lucide-react';

export default function Index() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const handleProductCreated = (productId: string) => {
    setSelectedProductId(productId);
  };

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent glow-primary">
                  <Dna className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">DNA Traceability</h1>
                <p className="text-xs text-muted-foreground">Supply Chain Intelligence System</p>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
                <Activity className="w-4 h-4 text-primary animate-pulse-subtle" />
                <span className="text-xs font-medium text-muted-foreground">System Active</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
                <Shield className="w-4 h-4 text-health-high" />
                <span className="text-xs font-medium text-muted-foreground">Tamper-Evident</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            <CreateProductForm onProductCreated={handleProductCreated} />
            <ProductSelector 
              selectedProductId={selectedProductId}
              onSelectProduct={setSelectedProductId}
            />
            <EventLogger productId={selectedProductId} />
          </div>

          {/* Middle Column - Product Overview */}
          <div className="lg:col-span-1">
            <ProductOverview productId={selectedProductId} />
          </div>

          {/* Right Column - Timeline */}
          <div className="lg:col-span-1">
            <DNATimeline productId={selectedProductId} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <DNAHelix className="w-8 h-16 opacity-50" />
              <div>
                <p className="font-medium text-foreground/80">DNA-Based Product Traceability</p>
                <p className="text-xs">Bio-inspired computing for supply chain integrity</p>
              </div>
            </div>
            <div className="text-center sm:text-right text-xs space-y-1">
              <p>Demonstrating DBMS normalization, event-driven architecture</p>
              <p>& tamper-evident history tracking</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
