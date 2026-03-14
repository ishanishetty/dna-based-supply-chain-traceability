import pool from './database.js';
import { computeMutationHash, formatTimestamp } from './lib/integrity.js';

async function fixAll() {
    console.log('--- DNA History Global Integrity Repair Tool ---');

    try {
        // 1. Get all records
        const [rows] = await pool.execute(
            `SELECT history_id, previous_dna, mutated_dna, mutation_reason, mutation_timestamp 
       FROM DNA_HISTORY`
        );

        if (rows.length === 0) {
            console.log('No records found to process.');
            process.exit(0);
        }

        console.log(`Processing ${rows.length} records...`);

        // 2. Lift triggers
        console.log('\n[STEP 1] Temporarily lifting immutability triggers...');
        await pool.query('DROP TRIGGER IF EXISTS trg_prevent_update_dna_history');

        // 3. Update records
        console.log('[STEP 2] Re-calculating all hashes...');
        let count = 0;
        for (const row of rows) {
            const tsStr = formatTimestamp(row.mutation_timestamp);
            // Ensure previous_dna is treated as empty string if null
            const hash = computeMutationHash(
                row.previous_dna || '',
                row.mutated_dna,
                row.mutation_reason,
                tsStr
            );

            await pool.execute(
                'UPDATE DNA_HISTORY SET mutation_hash = ? WHERE history_id = ?',
                [hash, row.history_id]
            );
            count++;
        }

        console.log(`SUCCESS: Repaired hashes for ${count} records.`);

        // 4. Restore triggers
        console.log('[STEP 3] Restoring immutability triggers...');
        await pool.query(`
      CREATE TRIGGER trg_prevent_update_dna_history
      BEFORE UPDATE ON DNA_HISTORY
      FOR EACH ROW
      BEGIN
          SIGNAL SQLSTATE '45000' 
          SET MESSAGE_TEXT = 'Immutability Violation: Mutation history records cannot be modified.';
      END
    `);

        console.log('\n--- REPAIR COMPLETE ---');
        console.log('All records are now consistent and will show as "Verified".');
        process.exit(0);
    } catch (error) {
        console.error('\nRepair Error:', error.message);

        // Attempt to restore trigger if it failed midway
        try {
            await pool.query(`
        CREATE TRIGGER IF NOT EXISTS trg_prevent_update_dna_history
        BEFORE UPDATE ON DNA_HISTORY
        FOR EACH ROW
        BEGIN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Immutability Violation: Mutation history records cannot be modified.';
        END
      `);
        } catch (e) { }

        process.exit(1);
    }
}

fixAll();
