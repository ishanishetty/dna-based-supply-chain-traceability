import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function migrate() {
    console.log('Starting ROBUST migration...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'dna_trace',
        multipleStatements: true
    });

    try {
        // 1. Get current tables
        const [rows] = await connection.query('SHOW TABLES');
        const tables = rows.map(r => Object.values(r)[0]);
        console.log('Current tables:', tables);

        // 2. Helper to rename if needed
        async function safeRename(oldName, newName) {
            const lowerTables = tables.map(t => t.toLowerCase());
            const oldExists = lowerTables.includes(oldName.toLowerCase());
            const newExists = lowerTables.includes(newName.toLowerCase());

            if (oldExists && !newExists) {
                // Case change on Windows needs temp
                if (oldName.toLowerCase() === newName.toLowerCase()) {
                    console.log(`Renaming ${oldName} to ${newName} (Case change)...`);
                    await connection.query(`RENAME TABLE \`${oldName}\` TO \`${oldName}_tmp\``);
                    await connection.query(`RENAME TABLE \`${oldName}_tmp\` TO \`${newName}\``);
                } else {
                    console.log(`Renaming ${oldName} to ${newName}...`);
                    await connection.query(`RENAME TABLE \`${oldName}\` TO \`${newName}\``);
                }
            } else if (newExists) {
                console.log(`Table ${newName} already exists. Skipping rename.`);
            } else {
                console.log(`Table ${oldName} not found. access to ${newName} might fail if not created later.`);
            }
        }

        await safeRename('products', 'PRODUCT');
        await safeRename('events', 'EVENT');
        await safeRename('dna_history', 'DNA_HISTORY');

        // 3. Create tables if not exist (EVENT_TYPE, REF, etc)
        console.log('Creating new tables...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS EVENT_TYPE (
        event_type_id INT AUTO_INCREMENT PRIMARY KEY,
        event_name VARCHAR(50) NOT NULL UNIQUE,
        mutation_rule VARCHAR(255),
        severity_weight INT DEFAULT 1
      );
    `);

        // Seed EVENT_TYPE
        await connection.query(`
      INSERT IGNORE INTO EVENT_TYPE (event_name, mutation_rule, severity_weight) VALUES
      ('delay', 'increase_instability', 2),
      ('quality_issue', 'degrade_health', 5),
      ('temperature_violation', 'denature_dna', 8),
      ('reroute', 'add_tracing_marker', 1);
    `);

        await connection.query(`
      CREATE TABLE IF NOT EXISTS DNA (
        dna_id CHAR(36) PRIMARY KEY,
        product_id CHAR(36) NOT NULL UNIQUE,
        dna_sequence TEXT NOT NULL,
        health_score INT DEFAULT 100,
        risk_level VARCHAR(20) DEFAULT 'Low',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_dna_product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id) ON DELETE CASCADE
      );
    `);

        await connection.query(`
      CREATE TABLE IF NOT EXISTS HEALTH_LOG (
        health_log_id INT AUTO_INCREMENT PRIMARY KEY,
        product_id CHAR(36) NOT NULL,
        health_score INT NOT NULL,
        risk_level VARCHAR(20),
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_health_product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id) ON DELETE CASCADE
      );
    `);

        // 4. Data Migration
        console.log('Migrating data...');
        // Check if DNA is empty
        const [dnaRows] = await connection.query('SELECT COUNT(*) as count FROM DNA');
        if (dnaRows[0].count === 0) {
            console.log('Populating DNA table...');
            // Need to check if PRODUCT still has old columns
            // We can inspect PRODUCT columns
            const [funcRows] = await connection.query('SHOW COLUMNS FROM PRODUCT LIKE "current_dna"');
            if (funcRows.length > 0) {
                await connection.query(`
                INSERT INTO DNA (dna_id, product_id, dna_sequence, health_score, risk_level, last_updated)
                SELECT UUID(), product_id, current_dna, health, 
                CASE WHEN health > 80 THEN 'Low' WHEN health > 50 THEN 'Medium' ELSE 'High' END,
                NOW()
                FROM PRODUCT
             `);
            }
        }

        // 5. Update EVENT table
        const [eventCols] = await connection.query('SHOW COLUMNS FROM EVENT LIKE "event_type_id"');
        if (eventCols.length === 0) {
            console.log('Updating EVENT table schema...');
            await connection.query('ALTER TABLE EVENT ADD COLUMN event_type_id INT');
            // Backfill
            await connection.query(`
            UPDATE EVENT e
            JOIN EVENT_TYPE et ON e.event_type = et.event_name
            SET e.event_type_id = et.event_type_id;
         `);
        }

        // 6. Final Schema Polish
        try {
            await connection.query(`
          ALTER TABLE EVENT
          CHANGE COLUMN event_time event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ADD COLUMN IF NOT EXISTS event_description VARCHAR(255), 
          ADD COLUMN IF NOT EXISTS event_severity INT DEFAULT 1,
          ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Logged',
          ADD CONSTRAINT fk_event_type FOREIGN KEY (event_type_id) REFERENCES EVENT_TYPE(event_type_id)
        `);
        } catch (e) { console.log('EVENT alter skipped or failed (safe to ignore if already done):', e.message); }

        try {
            await connection.query(`
         ALTER TABLE PRODUCT 
         CHANGE COLUMN name product_name VARCHAR(255) NOT NULL,
         CHANGE COLUMN batch_no batch_number VARCHAR(255) NOT NULL
        `);
        } catch (e) { console.log('PRODUCT rename columns skipped:', e.message); }

        // Cleanup old columns
        try {
            await connection.query(`ALTER TABLE PRODUCT DROP COLUMN initial_dna`);
            await connection.query(`ALTER TABLE PRODUCT DROP COLUMN current_dna`);
            await connection.query(`ALTER TABLE PRODUCT DROP COLUMN health`);
        } catch (e) { /* ignore if already dropped */ }

        // DNA_HISTORY tweaks
        try {
            await connection.query(`
         ALTER TABLE DNA_HISTORY
         CHANGE COLUMN dna_id history_id CHAR(36) NOT NULL,
         CHANGE COLUMN new_dna mutated_dna TEXT NOT NULL,
         CHANGE COLUMN mutated_at mutation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         ADD COLUMN IF NOT EXISTS event_id CHAR(36)
        `);
        } catch (e) { console.log('DNA_HISTORY alter skipped:', e.message); }

        console.log('Migration complete!');
        await connection.end();

    } catch (error) {
        console.error('Migration failed:', error);
        await connection.end();
        process.exit(1);
    }
}

migrate();
