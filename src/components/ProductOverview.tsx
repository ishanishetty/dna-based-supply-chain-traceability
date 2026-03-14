import { useProduct } from '@/hooks/useProducts';
import { getRiskLevel } from '@/lib/dna';
import { DNASequence, DNAHelix } from '@/components/DNASequence';
import { HealthIndicator, RiskBadge } from '@/components/HealthIndicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FlaskConical, Factory, Hash, Fingerprint, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ProductOverviewProps {
  productId: string | null;
}

export function ProductOverview({ productId }: ProductOverviewProps) {
  const { data: product, isLoading } = useProduct(productId);

  if (!productId) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
            <DNAHelix className="mb-4 opacity-30" />
            <p className="text-lg font-medium">No Product Selected</p>
            <p className="text-sm">Create or select a product to view its DNA profile</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-16">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading product data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!product) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-16">
          <div className="text-center text-muted-foreground">
            <p>Product not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const risk = getRiskLevel(product.health);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 glow-primary">
              <FlaskConical className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{product.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Factory className="w-3.5 h-3.5" />
                {product.manufacturer}
              </CardDescription>
            </div>
          </div>
          <RiskBadge risk={risk} className="text-sm" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {/* Identifiers */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Hash className="w-3.5 h-3.5" />
              Batch Number
            </div>
            <Badge variant="secondary" className="font-mono text-xs">
              {product.batch_no}
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Fingerprint className="w-3.5 h-3.5" />
              Supply Chain ID
            </div>
            <Badge variant="secondary" className="font-mono text-xs">
              {product.supply_chain_id}
            </Badge>
          </div>
        </div>

        {/* DNA Section */}
        <div className="space-y-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">Current DNA Sequence</h4>
            <span className="text-xs text-muted-foreground font-mono">
              {product.current_dna.length} bases
            </span>
          </div>
          <DNASequence sequence={product.current_dna} size="lg" animate />
          
          {product.initial_dna !== product.current_dna && (
            <div className="pt-3 border-t border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Initial DNA</span>
              </div>
              <DNASequence sequence={product.initial_dna} size="sm" />
            </div>
          )}
        </div>

        {/* Health */}
        <HealthIndicator health={product.health} size="lg" />

        {/* Created Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border/50">
          <Calendar className="w-4 h-4" />
          Created {format(new Date(product.created_at), 'PPpp')}
        </div>
      </CardContent>
    </Card>
  );
}
