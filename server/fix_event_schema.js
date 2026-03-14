import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function fix() {
    console.log('Fixing EVENT table...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'dna_trace'
    });

    try {
        const [rows] = await connection.query('SHOW COLUMNS FROM EVENT');
        const cols = rows.map(r => r.Field);

        if (!cols.includes('event_description')) {
            console.log('Adding event_description...');
            await connection.query('ALTER TABLE EVENT ADD COLUMN event_description VARCHAR(255)');
        }

        if (!cols.includes('event_severity')) {
            console.log('Adding event_severity...');
            await connection.query('ALTER TABLE EVENT ADD COLUMN event_severity INT DEFAULT 1');
        }

        if (!cols.includes('status')) {
            console.log('Adding status...');
            await connection.query('ALTER TABLE EVENT ADD COLUMN status VARCHAR(50) DEFAULT "Logged"');
        }

        if (cols.includes('event_time') && !cols.includes('event_timestamp')) {
            console.log('Renaming event_time to event_timestamp...');
            await connection.query('ALTER TABLE EVENT CHANGE COLUMN event_time event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        }

        console.log('EVENT table fixed.');
        await connection.end();
    } catch (error) {
        console.error('Fix failed:', error);
        await connection.end();
    }
}
fix();
