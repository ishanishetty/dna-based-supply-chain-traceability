import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'dna_trace'
        });

        const [rows] = await connection.query('SHOW TABLES');
        console.log('Tables:', rows);
        await connection.end();
    } catch (error) {
        console.error(error);
    }
}
check();
