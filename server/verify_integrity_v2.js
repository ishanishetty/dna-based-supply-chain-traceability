import pool from './database.js';
import { computeMutationHash } from './lib/integrity.js';
import { v4 as uuidv4 } from 'uuid';

const productId = '7c76d571-23f7-4f20-9a11-0e17ec965e2f';

async function runTest() {
    console.log('--- Internal Logic Test: Mutation Hash Integrity ---');

    try {
        // 1. Simulate an event mutation
        console.log('\n1. Simulating a mutation...');
        const currentDNA = 'ATCGATCG';
        const newDNA = 'ATCGTTCG';
        const mutationReason = 'Test Mutation';
        const now = new Date();
        const mutationTimestamp = now.toISOString().slice(0, 19).replace('T', ' ');

        const mutationHash = computeMutationHash(currentDNA, newDNA, mutationReason, mutationTimestamp);
        const historyId = uuidv4();

        console.log(`Generated Hash: ${mutationHash}`);

        // 2. Insert into DB
        console.log('2. Inserting into DNA_HISTORY...');
        await pool.execute(
            `INSERT INTO DNA_HISTORY (history_id, product_id, previous_dna, mutated_dna, mutation_reason, mutation_timestamp, mutation_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [historyId, productId, currentDNA, newDNA, mutationReason, mutationTimestamp, mutationHash]
        );

        // 3. Verify integrity
        console.log('3. Verifying integrity of stored record...');
        const [rows] = await pool.execute(
            'SELECT * FROM DNA_HISTORY WHERE history_id = ?',
            [historyId]
        );
        const row = rows[0];

        let tsStr;
        if (row.mutation_timestamp instanceof Date) {
            tsStr = row.mutation_timestamp.toISOString().slice(0, 19).replace('T', ' ');
        } else {
            tsStr = String(row.mutation_timestamp);
        }

        const verifyHash = computeMutationHash(row.previous_dna, row.mutated_dna, row.mutation_reason, tsStr);

        console.log(`\nVerification Details:`);
        console.log(`  Prev DNA:  [${row.previous_dna}]`);
        console.log(`  Next DNA:  [${row.mutated_dna}]`);
        console.log(`  Reason:    [${row.mutation_reason}]`);
        console.log(`  Timestamp: [${tsStr}] (Original: ${mutationTimestamp})`);
        console.log(`  Hash:      [${row.mutation_hash}]`);
        console.log(`  Computed:  [${verifyHash}]`);

        if (verifyHash === row.mutation_hash) {
            console.log('SUCCESS: Integrity check PASSED for valid data.');
        } else {
            console.log('FAIL: Hash Mismatch!');
            console.log(`  Data 1 (Storage): ${row.previous_dna}${row.mutated_dna}${row.mutation_reason}${tsStr}`);
            console.log(`  Data 2 (Original): ${currentDNA}${newDNA}${mutationReason}${mutationTimestamp}`);
            throw new Error('FAIL: Integrity check FAILED for valid data!');
        }

        // 4. Tamper
        console.log('\n4. Tampering with data...');
        await pool.execute('UPDATE DNA_HISTORY SET mutated_dna = "TAMPERED" WHERE history_id = ?', [historyId]);

        // 5. Verify again
        console.log('5. Verifying AFTER tampering...');
        const [rows2] = await pool.execute('SELECT * FROM DNA_HISTORY WHERE history_id = ?', [historyId]);
        const row2 = rows2[0];

        const verifyHash2 = computeMutationHash(row2.previous_dna, row2.mutated_dna, row2.mutation_reason, tsStr);

        if (verifyHash2 !== row2.mutation_hash) {
            console.log('SUCCESS: Tampering correctly DETECTED.');
        } else {
            throw new Error('FAIL: Tampering NOT detected!');
        }

        // Cleanup
        console.log('\nCleaning up test record...');
        await pool.execute('DELETE FROM DNA_HISTORY WHERE history_id = ?', [historyId]);

        console.log('\n--- ALL INTERNAL TESTS PASSED ---');
        process.exit(0);
    } catch (error) {
        console.error('\nTEST FAILED:', error.message);
        process.exit(1);
    }
}

runTest();
