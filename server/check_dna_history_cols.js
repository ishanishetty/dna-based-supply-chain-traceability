import pool from './database.js';

async function checkDnaHistoryCols() {
    try {
        const [rows] = await pool.execute('SHOW COLUMNS FROM DNA_HISTORY');
        console.log('DNA_HISTORY Columns:', rows.map(r => r.Field));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkDnaHistoryCols();
