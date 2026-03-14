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

        const [rows] = await connection.query('SHOW COLUMNS FROM DNA_HISTORY');
        console.log('DNA_HISTORY Columns:', rows.map(r => r.Field));

        const [rows2] = await connection.query('SHOW COLUMNS FROM PRODUCT');
        console.log('PRODUCT Columns:', rows2.map(r => r.Field));

        await connection.end();
    } catch (error) {
        console.error(error);
    }
}
check();
