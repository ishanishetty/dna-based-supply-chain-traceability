import { useProducts } from '@/hooks/useProducts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Loader2 } from 'lucide-react';

interface ProductSelectorProps {
  selectedProductId: string | null;
  onSelectProduct: (productId: string | null) => void;
}

export function ProductSelector({ selectedProductId, onSelectProduct }: ProductSelectorProps) {
  const { data: products, isLoading } = useProducts();

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading products...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent/50">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Select Product</CardTitle>
            <CardDescription>Choose a product to view its DNA profile</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!products || products.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">No products yet. Create one above!</p>
          </div>
        ) : (
          <Select 
            value={selectedProductId || undefined} 
            onValueChange={(value) => onSelectProduct(value || null)}
          >
            <SelectTrigger className="w-full bg-input/50">
              <SelectValue placeholder="Select a product..." />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.product_id} value={product.product_id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-muted-foreground text-xs">({product.batch_no})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
}
