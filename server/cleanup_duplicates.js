import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function cleanup() {
    console.log('Cleaning up duplicate products...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'dna_trace'
    });

    try {
        // Identify duplicates to delete
        // We want to keep the one with the LATEST created_at or UUID (arbitrary if same time).
        // Let's keep the one with max created_at.

        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Delete duplicates
        // Using a multi-table delete or a temporary table strategy is safest in MySQL.
        // Logic: Delete p1 if there exists p2 with same keys and p1.id < p2.id (or p1.created < p2.created)
        // Actually, user wants "entry only once".

        const [rows] = await connection.query(`
        SELECT product_name, manufacturer, batch_number, COUNT(*) as c
        FROM PRODUCT
        GROUP BY product_name, manufacturer, batch_number
        HAVING c > 1
    `);

        console.log(`Found ${rows.length} sets of duplicates.`);

        for (const row of rows) {
            console.log(`Processing duplicate: ${row.product_name} - ${row.batch_number}`);

            // Get IDs
            const [ids] = await connection.query(`
            SELECT product_id FROM PRODUCT 
            WHERE product_name = ? AND manufacturer = ? AND batch_number = ?
            ORDER BY created_at DESC
        `, [row.product_name, row.manufacturer, row.batch_number]);

            // ids[0] is the one to KEEP (latest). All others fetch.
            const keepId = ids[0].product_id;
            const deleteIds = ids.slice(1).map(x => x.product_id);

            if (deleteIds.length > 0) {
                console.log(`Keeping ${keepId}, deleting ${deleteIds.join(', ')}`);
                // Delete from all tables to be clean (CASCADE should handle it but let's be explicit if needed, but CASCADE ON DELETE is set)
                // Just delete from PRODUCT -> cascades to DNA, EVENT, HISTORY
                await connection.query(`DELETE FROM PRODUCT WHERE product_id IN (?)`, [deleteIds]);
            }
        }

        console.log('Cleanup done.');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        await connection.end();

    } catch (error) {
        console.error('Cleanup failed:', error);
        await connection.end();
    }
}
cleanup();
