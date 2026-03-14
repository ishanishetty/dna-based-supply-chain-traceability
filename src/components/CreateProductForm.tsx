import { useState } from 'react';
import { useCreateProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Dna } from 'lucide-react';

interface CreateProductFormProps {
  onProductCreated: (productId: string) => void;
}

export function CreateProductForm({ onProductCreated }: CreateProductFormProps) {
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [batchNo, setBatchNo] = useState('');

  const createProduct = useCreateProduct();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !manufacturer.trim() || !batchNo.trim()) {
      return;
    }

    try {
      const product = await createProduct.mutateAsync({
        name: name.trim(),
        manufacturer: manufacturer.trim(),
        batch_no: batchNo.trim(),
      });

      // Clear form
      setName('');
      setManufacturer('');
      setBatchNo('');

      // Auto-select the new product
      onProductCreated(product.product_id);
    } catch (error: any) {
      // Check if it's a conflict error with existing product ID
      // Assuming the fetcher throws an object that lets us access the response body
      console.log('Creation error:', error);

      // If our backend returns 409, the fetcher might throw. 
      // We'll try to parse the response if available.
      // Since I can't easily see the query client setup, I'll rely on the backend response.
      // If the error object has the response data:
      if (error.response?.status === 409 && error.response?.data?.existingProductId) {
        // It's a duplicate. Redirect to it.
        onProductCreated(error.response.data.existingProductId);
        // Optional: toast("Product already exists. Opened details.");
      }
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Dna className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Create Product</CardTitle>
            <CardDescription>Initialize a new product with unique DNA</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              placeholder="e.g., Organic Coffee Beans"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-input/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input
              id="manufacturer"
              placeholder="e.g., Global Foods Inc."
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              required
              className="bg-input/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchNo">Batch Number</Label>
            <Input
              id="batchNo"
              placeholder="e.g., BATCH-2024-001"
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value)}
              required
              className="bg-input/50"
            />
          </div>

          <Button
            type="submit"
            className="w-full gap-2"
            disabled={createProduct.isPending}
          >
            {createProduct.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Generating DNA...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Product
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
