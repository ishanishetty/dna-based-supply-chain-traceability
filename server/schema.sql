-- Create database (run this manually if database doesn't exist)
-- CREATE DATABASE IF NOT EXISTS dna_trace;
-- USE dna_trace;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  product_id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  manufacturer VARCHAR(255) NOT NULL,
  batch_no VARCHAR(255) NOT NULL,
  supply_chain_id VARCHAR(255) NOT NULL UNIQUE,
  initial_dna TEXT NOT NULL,
  current_dna TEXT NOT NULL,
  health INT NOT NULL DEFAULT 100 CHECK (health >= 0 AND health <= 100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  event_id CHAR(36) PRIMARY KEY,
  product_id CHAR(36) NOT NULL,
  event_type ENUM('delay', 'quality_issue', 'temperature_violation', 'reroute') NOT NULL,
  event_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- DNA History table
CREATE TABLE IF NOT EXISTS dna_history (
  dna_id CHAR(36) PRIMARY KEY,
  product_id CHAR(36) NOT NULL,
  previous_dna TEXT,
  new_dna TEXT NOT NULL,
  mutation_reason VARCHAR(255) NOT NULL,
  mutated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_product_id ON events(product_id);
CREATE INDEX IF NOT EXISTS idx_dna_history_product_id ON dna_history(product_id);
CREATE INDEX IF NOT EXISTS idx_dna_history_mutated_at ON dna_history(product_id, mutated_at);

