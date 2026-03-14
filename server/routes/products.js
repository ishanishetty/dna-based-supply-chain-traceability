import express from 'express';
import pool from '../database.js';
import { v4 as uuidv4 } from 'uuid';
import { generateInitialDNA } from '../lib/dna.js';
import { computeMutationHash, formatTimestamp } from '../lib/integrity.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.product_id, p.product_name as name, p.manufacturer, p.batch_number as batch_no, 
              p.supply_chain_id, d.dna_sequence as current_dna, d.dna_sequence as initial_dna, 
              d.health_score as health, p.created_at
       FROM PRODUCT p
       LEFT JOIN DNA d ON p.product_id = d.product_id
       ORDER BY p.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.product_id, p.product_name as name, p.manufacturer, p.batch_number as batch_no, 
              p.supply_chain_id, d.dna_sequence as current_dna, d.dna_sequence as initial_dna, 
              d.health_score as health, p.created_at
       FROM PRODUCT p
       LEFT JOIN DNA d ON p.product_id = d.product_id
       WHERE p.product_id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const { name, manufacturer, batch_no } = req.body;

    if (!name || !manufacturer || !batch_no) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for existing product
    const [existingRows] = await pool.execute(
      `SELECT product_id FROM PRODUCT 
         WHERE product_name = ? AND manufacturer = ? AND batch_number = ?`,
      [name, manufacturer, batch_no]
    );

    if (existingRows.length > 0) {
      const existingId = existingRows[0].product_id;
      console.log(`Duplicate entry attempt. Returning existing ID: ${existingId}`);
      // Return 409 Conflict but include the ID so frontend can redirect
      return res.status(409).json({
        error: 'Product already exists',
        existingProductId: existingId,
        message: 'A product with this Batch Number and Manufacturer already exists.'
      });
    }

    const productId = uuidv4();
    const dnaId = uuidv4();
    const initialDNA = generateInitialDNA();
    const supplyChainId = `SC-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Insert product into PRODUCT table
    await pool.execute(
      `INSERT INTO PRODUCT (product_id, product_name, manufacturer, batch_number, supply_chain_id)
       VALUES (?, ?, ?, ?, ?)`,
      [productId, name, manufacturer, batch_no, supplyChainId]
    );

    // Insert DNA into DNA table
    await pool.execute(
      `INSERT INTO DNA (dna_id, product_id, dna_sequence, health_score, risk_level)
       VALUES (?, ?, ?, ?, ?)`,
      [dnaId, productId, initialDNA, 100, 'Low']
    );

    // Insert initial DNA history entry
    const historyId = uuidv4();
    const mutationReason = 'Product Created';
    const now = new Date();
    const mutationTimestamp = formatTimestamp(now);

    // For the initial entry, previous_dna is null or empty string. 
    // In our verification logic, we check for null/undefined.
    // Hashing null as string "null" or empty string ""? 
    // Let's use empty string for consistency if it's null.
    const mutationHash = computeMutationHash('', initialDNA, mutationReason, mutationTimestamp);

    await pool.execute(
      `INSERT INTO DNA_HISTORY (history_id, product_id, previous_dna, mutated_dna, mutation_reason, mutation_timestamp, mutation_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [historyId, productId, null, initialDNA, mutationReason, mutationTimestamp, mutationHash]
    );

    // Fetch and return the created product (using same alias logic)
    const [rows] = await pool.execute(
      `SELECT p.product_id, p.product_name as name, p.manufacturer, p.batch_number as batch_no, 
              p.supply_chain_id, d.dna_sequence as current_dna, d.health_score as health, p.created_at
       FROM PRODUCT p
       LEFT JOIN DNA d ON p.product_id = d.product_id
       WHERE p.product_id = ?`,
      [productId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

