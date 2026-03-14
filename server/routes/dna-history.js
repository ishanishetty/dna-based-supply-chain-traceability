import express from 'express';
import pool from '../database.js';
import { computeMutationHash, formatTimestamp } from '../lib/integrity.js';

const router = express.Router();

// Get DNA history for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT history_id as dna_id, product_id, event_id, previous_dna, mutated_dna as new_dna, 
              mutation_reason, mutation_timestamp as mutated_at, mutation_hash
       FROM DNA_HISTORY 
       WHERE product_id = ? 
       ORDER BY mutation_timestamp ASC`,
      [req.params.productId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching DNA history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify integrity of DNA history
router.get('/:productId/verify', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT history_id, product_id, previous_dna, mutated_dna, mutation_reason, mutation_timestamp, mutation_hash
       FROM DNA_HISTORY 
       WHERE product_id = ? 
       ORDER BY mutation_timestamp ASC`,
      [req.params.productId]
    );

    const verificationResults = rows.map(row => {
      const tsStr = formatTimestamp(row.mutation_timestamp);

      const computedHash = computeMutationHash(
        row.previous_dna || '',
        row.mutated_dna,
        row.mutation_reason,
        tsStr
      );

      const isValid = computedHash === row.mutation_hash;

      return {
        history_id: row.history_id,
        valid: isValid,
        stored_hash: row.mutation_hash,
        computed_hash: computedHash
      };
    });

    res.json(verificationResults);
  } catch (error) {
    console.error('Error verifying DNA history:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
