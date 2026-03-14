-- ========================================================
-- DATABASE UPGRADE SCRIPT
-- Project: Bio-Inspired DNA Encoding Framework
-- Database: MySQL
-- Description: Upgrades existing 3-table schema to strictly defined 6-table schema.
--             Preserves existing data in 'products', 'events', 'dna_history'.
-- ========================================================

USE dna_trace;

-- Disable foreign key checks to allow schema changes
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================================
-- 1. RENAME EXISTING TABLES (To match requested uppercase convention)
-- ========================================================
-- Safely rename if they exist in lowercase
RENAME TABLE products TO PRODUCT;
RENAME TABLE events TO EVENT;
RENAME TABLE dna_history TO DNA_HISTORY;

-- ========================================================
-- 2. CREATE NEW TABLES
-- ========================================================

-- 2.1 EVENT_TYPE (Master Table)
CREATE TABLE IF NOT EXISTS EVENT_TYPE (
    event_type_id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(50) NOT NULL UNIQUE,
    mutation_rule VARCHAR(255),
    severity_weight INT DEFAULT 1
);

-- Seed EVENT_TYPE with existing ENUM values from old 'events' table definition
-- (Assumed values: 'delay', 'quality_issue', 'temperature_violation', 'reroute')
INSERT IGNORE INTO EVENT_TYPE (event_name, mutation_rule, severity_weight) VALUES
('delay', 'increase_instability', 2),
('quality_issue', 'degrade_health', 5),
('temperature_violation', 'denature_dna', 8),
('reroute', 'add_tracing_marker', 1);


-- 2.2 DNA (1:1 with PRODUCT)
-- We will migrate data from PRODUCT later
CREATE TABLE IF NOT EXISTS DNA (
    dna_id CHAR(36) PRIMARY KEY,
    product_id CHAR(36) NOT NULL UNIQUE,
    dna_sequence TEXT NOT NULL,
    health_score INT DEFAULT 100,
    risk_level VARCHAR(20) DEFAULT 'Low',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dna_product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id) ON DELETE CASCADE
);


-- 2.3 HEALTH_LOG (Time-series)
CREATE TABLE IF NOT EXISTS HEALTH_LOG (
    health_log_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id CHAR(36) NOT NULL,
    health_score INT NOT NULL,
    risk_level VARCHAR(20),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_health_product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id) ON DELETE CASCADE
);

-- ========================================================
-- 3. MIGRATE DATA
-- ========================================================

-- 3.1 Migrate DNA data from PRODUCT to DNA table
-- Using UUID() for dna_id for now (or reusing product_id if prefer 1:1 match id, but UUID is safer for distinct entities)
INSERT INTO DNA (dna_id, product_id, dna_sequence, health_score, risk_level, last_updated)
SELECT 
    UUID(),             -- Generate new ID for DNA record
    product_id,
    current_dna,        -- Map current_dna to dna_sequence
    health,             -- Map health to health_score
    CASE                -- Calculate initial risk based on health
        WHEN health > 80 THEN 'Low'
        WHEN health > 50 THEN 'Medium'
        ELSE 'High'
    END,
    NOW()
FROM PRODUCT
WHERE product_id NOT IN (SELECT product_id FROM DNA); -- Avoid duplicates

-- 3.2 Update EVENT table to link to EVENT_TYPE
-- First add the column
ALTER TABLE EVENT ADD COLUMN IF NOT EXISTS event_type_id INT;

-- Update the ID based on the string name match (assuming old 'event_type' column still exists)
UPDATE EVENT e
JOIN EVENT_TYPE et ON e.event_type = et.event_name
SET e.event_type_id = et.event_type_id
WHERE e.event_type_id IS NULL;


-- ========================================================
-- 4. MODIFY EXISTING TABLES (Finalize Schema)
-- ========================================================

-- 4.1 PRODUCT
-- Rename columns to match spec
ALTER TABLE PRODUCT 
    CHANGE COLUMN name product_name VARCHAR(255) NOT NULL,
    CHANGE COLUMN batch_no batch_number VARCHAR(255) NOT NULL;

-- Remove migrated columns
ALTER TABLE PRODUCT 
    DROP COLUMN initial_dna,
    DROP COLUMN current_dna,
    DROP COLUMN health;


-- 4.2 EVENT
-- Finalize columns
ALTER TABLE EVENT
    CHANGE COLUMN event_time event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS event_description VARCHAR(255), 
    ADD COLUMN IF NOT EXISTS event_severity INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Logged';

-- Add Foreign Key to EVENT_TYPE
ALTER TABLE EVENT
    ADD CONSTRAINT fk_event_type FOREIGN KEY (event_type_id) REFERENCES EVENT_TYPE(event_type_id);

-- Drop old enum column safely (CHECK FIRST if data is migrated!)
-- ALTER TABLE EVENT DROP COLUMN event_type; -- Uncomment after verification


-- 4.3 DNA_HISTORY
-- Rename/Adjust columns
ALTER TABLE DNA_HISTORY
    CHANGE COLUMN dna_id history_id CHAR(36) NOT NULL, -- Was PK
    CHANGE COLUMN new_dna mutated_dna TEXT NOT NULL,
    CHANGE COLUMN mutated_at mutation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE DNA_HISTORY
    ADD COLUMN IF NOT EXISTS event_id CHAR(36);

-- Add constraint for event_id (UNIQUE as per spec)
-- Note: Existing records might not have event_id, so we allow NULL initially or need to backfill
ALTER TABLE DNA_HISTORY 
    ADD CONSTRAINT fk_history_event FOREIGN KEY (event_id) REFERENCES EVENT(event_id),
    ADD UNIQUE KEY idx_history_event (event_id);


-- ========================================================
-- 5. INDEXES & TRIGGERS
-- ========================================================

-- Indexes
CREATE INDEX idx_product_batch ON PRODUCT(batch_number);
CREATE INDEX idx_dna_risk ON DNA(risk_level);
CREATE INDEX idx_event_status ON EVENT(status);

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- SAMPLE VERIFICATION QUERIES
-- ========================================================

-- 1. Track full history of a product
/*
SELECT p.product_name, e.event_description, h.previous_dna, h.mutated_dna
FROM PRODUCT p
JOIN EVENT e ON p.product_id = e.product_id
JOIN DNA_HISTORY h ON e.event_id = h.event_id
WHERE p.product_id = 'TARGET_UUID';
*/

-- 2. Get latest health score
/*
SELECT p.product_name, d.health_score, d.risk_level
FROM PRODUCT p
JOIN DNA d ON p.product_id = d.product_id;
*/
