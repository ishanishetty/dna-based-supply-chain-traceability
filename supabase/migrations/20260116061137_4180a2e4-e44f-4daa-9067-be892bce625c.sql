-- Products table
CREATE TABLE public.products (
  product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  batch_no TEXT NOT NULL,
  supply_chain_id TEXT NOT NULL UNIQUE DEFAULT ('SC-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8))),
  initial_dna TEXT NOT NULL,
  current_dna TEXT NOT NULL,
  health INTEGER NOT NULL DEFAULT 100 CHECK (health >= 0 AND health <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events table
CREATE TABLE public.events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('delay', 'quality_issue', 'temperature_violation', 'reroute')),
  event_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DNA History table
CREATE TABLE public.dna_history (
  dna_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  previous_dna TEXT,
  new_dna TEXT NOT NULL,
  mutation_reason TEXT NOT NULL,
  mutated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_events_product_id ON public.events(product_id);
CREATE INDEX idx_dna_history_product_id ON public.dna_history(product_id);
CREATE INDEX idx_dna_history_mutated_at ON public.dna_history(product_id, mutated_at);

-- Enable RLS but allow public access (this is a demo/academic system without auth)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dna_history ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required for this academic demo)
CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public read access on events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on events" ON public.events FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on dna_history" ON public.dna_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on dna_history" ON public.dna_history FOR INSERT WITH CHECK (true);