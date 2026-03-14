-- Migration: Add mutation_hash column to DNA_HISTORY table
-- Description: Adds a SHA-256 hash column for tamper-proof auditing

USE dna_trace;

ALTER TABLE DNA_HISTORY
ADD COLUMN mutation_hash VARCHAR(64) NOT NULL DEFAULT '';

-- Optional: Update existing records with a placeholder or calculated hash if possible
-- For now, we will leave them with empty string or handle them in application logic checks
-- (Logic: If hash is empty, it might be a legacy record, or we can compute it now)

-- Let's attempt to backfill simple hashes for existing records (Best Effort)
-- Note: In a real scenario, we might needs application logic to generate the exact hash string format
-- UPDATE DNA_HISTORY SET mutation_hash = SHA2(CONCAT(previous_dna, mutated_dna, mutation_reason, mutation_timestamp), 256) WHERE mutation_hash = '';
