import pool from './database.js';
import { computeMutationHash } from './lib/integrity.js';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const productId = '7c76d571-23f7-4f20-9a11-0e17ec965e2f';

async function runTest() {
    console.log('--- Integration Test: Mutation Hash Integrity ---');

    try {
        // 1. Create a new event
        console.log('\n1. Creating a new event...');
        const eventResp = await axios.post(`${API_URL}/events`, {
            productId,
            eventType: 'delay'
        });
        console.log('Event created successfully.');

        // 2. Fetch DNA History and check hash
        console.log('\n2. Checking DNA_HISTORY for hash...');
        const [historyRows] = await pool.execute(
            'SELECT * FROM DNA_HISTORY WHERE product_id = ? ORDER BY mutation_timestamp DESC LIMIT 1',
            [productId]
        );
        const lastEntry = historyRows[0];
        console.log(`Last Entry ID: ${lastEntry.history_id}`);
        console.log(`Stored Hash:  ${lastEntry.mutation_hash}`);

        if (lastEntry.mutation_hash && lastEntry.mutation_hash.length === 64) {
            console.log('SUCCESS: Hash generated and stored correctly.');
        } else {
            throw new Error('FAIL: Hash not found or invalid format.');
        }

        // 3. Verify via API
        console.log('\n3. Verifying integrity via API...');
        const verifyResp = await axios.get(`${API_URL}/dna-history/${productId}/verify`);
        const verification = verifyResp.data.find(v => v.history_id === lastEntry.history_id);

        if (verification && verification.valid) {
            console.log('SUCCESS: API verified integrity as VALID.');
        } else {
            throw new Error('FAIL: API failed to verify integrity.');
        }

        // 4. Manually tamper with the record
        console.log('\n4. Tampering with the record (changing mutated_dna)...');
        await pool.execute(
            'UPDATE DNA_HISTORY SET mutated_dna = "TAMPERED-DNA" WHERE history_id = ?',
            [lastEntry.history_id]
        );

        // 5. Verify via API again
        console.log('\n5. Verifying AFTER tampering...');
        const verifyResp2 = await axios.get(`${API_URL}/dna-history/${productId}/verify`);
        const verification2 = verifyResp2.data.find(v => v.history_id === lastEntry.history_id);

        if (verification2 && !verification2.valid) {
            console.log('SUCCESS: API correctly detected TAMPERING.');
        } else {
            throw new Error('FAIL: API failed to detect tampering!');
        }

        console.log('\n--- ALL TESTS PASSED ---');
        process.exit(0);
    } catch (error) {
        console.error('\nTEST FAILED:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        process.exit(1);
    }
}

runTest();
