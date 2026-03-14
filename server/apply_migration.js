import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyMigration() {
    console.log('Applying mutation hash migration...');

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'dna_trace',
            multipleStatements: true
        });

        console.log('Connected to database.');

        const sqlPath = path.join(__dirname, 'migrations', 'add_immutability_triggers.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing add_immutability_triggers.sql...');
        await connection.query(sql);

        console.log('Migration applied successfully.');
        await connection.end();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

applyMigration();
