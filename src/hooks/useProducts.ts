import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
import { generateInitialDNA, applyMutation, calculateHealth, getRiskLevel, EventType } from '@/lib/dna';
import { toast } from 'sonner';

export interface Product {
  product_id: string;
  name: string;
  manufacturer: string;
  batch_no: string;
  supply_chain_id: string;
  initial_dna: string;
  current_dna: string;
  health: number;
  created_at: string;
}

export interface DNAHistoryEntry {
  dna_id: string;
  product_id: string;
  previous_dna: string | null;
  new_dna: string;
  mutation_reason: string;
  mutated_at: string;
  mutation_hash: string;
}

export interface IntegrityVerificationResult {
  history_id: string;
  valid: boolean;
  stored_hash: string;
}

export interface Event {
  event_id: string;
  product_id: string;
  event_type: EventType;
  event_time: string;
}

// Fetch all products
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      return await api.get<Product[]>('/products');
    },
  });
}

// Fetch single product
export function useProduct(productId: string | null) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null;
      return await api.get<Product>(`/products/${productId}`);
    },
    enabled: !!productId,
  });
}

// Fetch DNA history for a product
export function useDNAHistory(productId: string | null) {
  return useQuery({
    queryKey: ['dna-history', productId],
    queryFn: async () => {
      if (!productId) return [];
      return await api.get<DNAHistoryEntry[]>(`/dna-history/product/${productId}`);
    },
    enabled: !!productId,
  });
}

// Verify DNA integrity for a product
export function useVerifyIntegrity(productId: string | null) {
  return useQuery({
    queryKey: ['dna-integrity', productId],
    queryFn: async () => {
      if (!productId) return [];
      return await api.get<IntegrityVerificationResult[]>(`/dna-history/${productId}/verify`);
    },
    enabled: !!productId,
    // Refetch when history changes
    staleTime: 0,
  });
}

// Create new product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; manufacturer: string; batch_no: string }) => {
      return await api.post<Product>('/products', data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dna-integrity', data.product_id] });
      toast.success('Product created successfully');
    },
    onError: (error: any) => {
      // If it's a conflict (409), we handle it in the UI (redirect), so don't show generic error toast
      if (error?.response?.status === 409) {
        return;
      }
      toast.error(`Failed to create product: ${error.message}`);
    },
  });
}

// Add event to product
export function useAddEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, eventType }: { productId: string; eventType: EventType }) => {
      return await api.post<{
        product: Product;
        newDNA: string;
        newHealth: number;
        riskLevel: string;
      }>('/events', { productId, eventType });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.product.product_id] });
      queryClient.invalidateQueries({ queryKey: ['dna-history', data.product.product_id] });
      queryClient.invalidateQueries({ queryKey: ['dna-integrity', data.product.product_id] });
      toast.success('Event logged and DNA mutated');
    },
    onError: (error) => {
      toast.error(`Failed to log event: ${error.message}`);
    },
  });
}
