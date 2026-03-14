import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function addConstraint() {
    console.log('Adding UNIQUE constraint to PRODUCT table...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'dna_trace'
    });

    try {
        // Add unique index on (product_name, manufacturer, batch_number)
        // Using IGNORE in case duplicate data already exists? No, user said "entry only once", implying strictness.
        // If duplicates exist, this will fail. That's good, we'll see the error.
        await connection.query(`
      ALTER TABLE PRODUCT 
      ADD UNIQUE KEY idx_unique_product_batch (product_name, manufacturer, batch_number)
    `);
        console.log('Constraint added successfully.');
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.error('Failed: Duplicate entries already exist. Please clean up data first.');
        } else if (error.code === 'ER_DUP_KEYNAME') {
            console.log('Constraint already exists.');
        } else {
            console.error('Error:', error.message);
        }
    } finally {
        await connection.end();
    }
}
addConstraint();
