-- Verify DNA Trace Database
-- Run this in MySQL Workbench to verify the database exists

-- Show all databases (dna_trace should be in the list)
SHOW DATABASES;

-- Use the dna_trace database
USE dna_trace;

-- Show tables in dna_trace
SHOW TABLES;

-- Show structure of products table
DESCRIBE products;

-- Show structure of events table
DESCRIBE events;

-- Show structure of dna_history table
DESCRIBE dna_history;

-- Count records in each table
SELECT 'products' as table_name, COUNT(*) as record_count FROM products
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'dna_history', COUNT(*) FROM dna_history;




