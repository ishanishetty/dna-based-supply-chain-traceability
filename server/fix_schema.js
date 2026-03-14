import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function fix() {
    console.log('Fixing schema...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'dna_trace'
    });

    try {
        // Check columns first
        const [cols] = await connection.query('SHOW COLUMNS FROM DNA_HISTORY');
        const colNames = cols.map(c => c.Field);
        console.log('Current DNA_HISTORY cols:', colNames);

        if (colNames.includes('dna_id')) {
            console.log('Renaming dna_id to history_id...');
            await connection.query('ALTER TABLE DNA_HISTORY CHANGE COLUMN dna_id history_id CHAR(36) NOT NULL');
        }

        if (colNames.includes('new_dna')) {
            console.log('Renaming new_dna to mutated_dna...');
            await connection.query('ALTER TABLE DNA_HISTORY CHANGE COLUMN new_dna mutated_dna TEXT NOT NULL');
        }

        if (colNames.includes('mutated_at')) {
            console.log('Renaming mutated_at to mutation_timestamp...');
            await connection.query('ALTER TABLE DNA_HISTORY CHANGE COLUMN mutated_at mutation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        }

        if (!colNames.includes('event_id')) {
            console.log('Adding event_id...');
            await connection.query('ALTER TABLE DNA_HISTORY ADD COLUMN event_id CHAR(36)');
        }

        console.log('Done.');
        await connection.end();

    } catch (error) {
        console.error('Fix failed:', error);
        await connection.end();
    }
}
fix();
