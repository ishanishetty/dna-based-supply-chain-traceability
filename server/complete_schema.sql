-- ========================================================
-- COMPLETE DATABASE SCHEMA
-- Project: Bio-Inspired DNA Encoding Framework
-- Database: MySQL
-- Description: Full schema definition for a fresh installation.
--             Includes Tables, Relationships, Triggers, and Sample Data.
-- ========================================================

-- CREATE DATABASE IF NOT EXISTS dna_trace;
-- USE dna_trace;

SET FOREIGN_KEY_CHECKS = 0;

-- ========================================================
-- 1. TABLE DEFINITIONS
-- ========================================================

-- 1.1 PRODUCT
CREATE TABLE IF NOT EXISTS PRODUCT (
    product_id CHAR(36) PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    batch_number VARCHAR(255) NOT NULL,
    supply_chain_id VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_batch (batch_number)
);

-- 1.2 EVENT_TYPE
CREATE TABLE IF NOT EXISTS EVENT_TYPE (
    event_type_id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(50) NOT NULL UNIQUE,
    mutation_rule VARCHAR(255),
    severity_weight INT DEFAULT 1
);

-- 1.3 DNA
CREATE TABLE IF NOT EXISTS DNA (
    dna_id CHAR(36) PRIMARY KEY,
    product_id CHAR(36) NOT NULL UNIQUE,
    dna_sequence TEXT NOT NULL,
    health_score INT DEFAULT 100,
    risk_level VARCHAR(20) DEFAULT 'Low',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dna_product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id) ON DELETE CASCADE,
    INDEX idx_dna_risk (risk_level)
);

-- 1.4 EVENT
CREATE TABLE IF NOT EXISTS EVENT (
    event_id CHAR(36) PRIMARY KEY,
    product_id CHAR(36) NOT NULL,
    event_type_id INT NOT NULL,
    event_description VARCHAR(255),
    event_severity INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'Logged',
    event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id) ON DELETE CASCADE,
    CONSTRAINT fk_event_type FOREIGN KEY (event_type_id) REFERENCES EVENT_TYPE(event_type_id),
    INDEX idx_event_status (status)
);

-- 1.5 DNA_HISTORY
CREATE TABLE IF NOT EXISTS DNA_HISTORY (
    history_id CHAR(36) PRIMARY KEY,
    product_id CHAR(36) NOT NULL,
    event_id CHAR(36) UNIQUE,
    previous_dna TEXT,
    mutated_dna TEXT NOT NULL,
    mutation_reason VARCHAR(255) NOT NULL,
    mutation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id) ON DELETE CASCADE,
    CONSTRAINT fk_history_event FOREIGN KEY (event_id) REFERENCES EVENT(event_id)
);

-- 1.6 HEALTH_LOG
CREATE TABLE IF NOT EXISTS HEALTH_LOG (
    health_log_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id CHAR(36) NOT NULL,
    health_score INT NOT NULL,
    risk_level VARCHAR(20),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_health_product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- 2. SAMPLE DATA
-- ========================================================

-- Event Types
INSERT IGNORE INTO EVENT_TYPE (event_name, mutation_rule, severity_weight) VALUES
('delay', 'increase_instability', 2),
('quality_issue', 'degrade_health', 5),
('temperature_violation', 'denature_dna', 8),
('reroute', 'add_tracing_marker', 1);

-- Product
INSERT INTO PRODUCT (product_id, product_name, manufacturer, batch_number, supply_chain_id) VALUES
('p1', 'Vaccine_Batch_A', 'PharmaCorp', 'BATCH-001', 'SC-1001'),
('p2', 'Organic_Produce', 'GreenFarm', 'BATCH-002', 'SC-1002');

-- DNA
INSERT INTO DNA (dna_id, product_id, dna_sequence, health_score, risk_level) VALUES
('d1', 'p1', 'ATCG-BASE-SEQ', 100, 'Low'),
('d2', 'p2', 'ATCG-FARM-SEQ', 95, 'Low');

-- Event
INSERT INTO EVENT (event_id, product_id, event_type_id, event_description, event_severity, status) VALUES
('e1', 'p1', 1, 'Delivery Delayed by 2 hours', 2, 'Resolved');

-- DNA History
INSERT INTO DNA_HISTORY (history_id, product_id, event_id, previous_dna, mutated_dna, mutation_reason) VALUES
('h1', 'p1', 'e1', 'ATCG-BASE-SEQ', 'ATCG-BASE-SEQ-MUT1', 'delay_instability');

-- ========================================================
-- 3. TRIGGERS
-- ========================================================

DELIMITER //

-- Trigger: Auto-insert into HEALTH_LOG when DNA health changes
CREATE TRIGGER after_dna_update
AFTER UPDATE ON DNA
FOR EACH ROW
BEGIN
    IF OLD.health_score <> NEW.health_score THEN
        INSERT INTO HEALTH_LOG (product_id, health_score, risk_level, recorded_at)
        VALUES (NEW.product_id, NEW.health_score, NEW.risk_level, NOW());
    END IF;
END;
//

DELIMITER ;

-- ========================================================
-- 4. SAMPLE QUERIES
-- ========================================================

-- View DNA Mutations
-- SELECT p.product_name, h.mutation_reason, h.mutated_dna 
-- FROM PRODUCT p JOIN DNA_HISTORY h ON p.product_id = h.product_id;

-- Get Latest Health Score
-- SELECT p.product_name, d.health_score FROM products p JOIN DNA d ON p.product_id = d.product_id;
