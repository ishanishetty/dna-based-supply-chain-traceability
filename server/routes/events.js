import express from 'express';
import pool from '../database.js';
import { v4 as uuidv4 } from 'uuid';
import { applyMutation, calculateHealth, getRiskLevel } from '../lib/dna.js';
import { computeMutationHash, formatTimestamp } from '../lib/integrity.js';

const router = express.Router();

// Get events for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.event_id, e.product_id, et.event_name as event_type, e.event_description, 
              e.event_severity, e.status, e.event_timestamp as event_time
       FROM EVENT e
       JOIN EVENT_TYPE et ON e.event_type_id = et.event_type_id
       WHERE e.product_id = ? 
       ORDER BY e.event_timestamp ASC`,
      [req.params.productId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add event to product
router.post('/', async (req, res) => {
  try {
    const { productId, eventType } = req.body;

    if (!productId || !eventType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Get Event Type ID and rules
    const [typeRows] = await pool.execute(
      'SELECT * FROM EVENT_TYPE WHERE event_name = ?',
      [eventType]
    );

    if (typeRows.length === 0) {
      return res.status(400).json({ error: 'Invalid event type' });
    }
    const eventTypeData = typeRows[0];
    const eventTypeId = eventTypeData.event_type_id;

    // 2. Get current product state (from DNA table now)
    const [dnaRows] = await pool.execute(
      'SELECT * FROM DNA WHERE product_id = ?',
      [productId]
    );

    if (dnaRows.length === 0) {
      return res.status(404).json({ error: 'Product DNA records not found' });
    }

    const dnaRecord = dnaRows[0];
    const currentDNA = dnaRecord.dna_sequence;
    const currentHealth = dnaRecord.health_score;

    // 3. Calculate new state
    const newDNA = applyMutation(currentDNA, eventType); // keeping same lib function assuming it takes string
    const newHealth = calculateHealth(currentHealth, eventType);
    const newRiskLevel = getRiskLevel(newHealth);

    // 4. Insert EVENT
    const eventId = uuidv4();
    const eventDescription = `Event: ${eventTypeData.event_name}`; // Simple description

    await pool.execute(
      `INSERT INTO EVENT (event_id, product_id, event_type_id, event_description, event_severity, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [eventId, productId, eventTypeId, eventDescription, eventTypeData.severity_weight, 'Logged']
    );

    // 5. Insert DNA_HISTORY
    const historyId = uuidv4();
    const mutationReason = eventType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const now = new Date();
    const mutationTimestamp = formatTimestamp(now);
    const mutationHash = computeMutationHash(currentDNA, newDNA, mutationReason, mutationTimestamp);

    await pool.execute(
      `INSERT INTO DNA_HISTORY (history_id, product_id, event_id, previous_dna, mutated_dna, mutation_reason, mutation_timestamp, mutation_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [historyId, productId, eventId, currentDNA, newDNA, mutationReason, mutationTimestamp, mutationHash]
    );

    // 6. Update DNA table
    await pool.execute(
      'UPDATE DNA SET dna_sequence = ?, health_score = ?, risk_level = ? WHERE product_id = ?',
      [newDNA, newHealth, newRiskLevel, productId]
    );

    // 7. Return result (matching old structure partially for frontend)
    // Frontend expects: product (with fields), newDNA, newHealth, riskLevel

    // We need to fetch product info to join
    const [productRows] = await pool.execute(
      `SELECT p.product_id, p.product_name as name, p.manufacturer, p.batch_number as batch_no, 
              p.supply_chain_id, d.dna_sequence as current_dna, d.health_score as health, p.created_at
         FROM PRODUCT p
         LEFT JOIN DNA d ON p.product_id = d.product_id
         WHERE p.product_id = ?`,
      [productId]
    );

    res.status(201).json({
      product: productRows[0],
      newDNA,
      newHealth,
      riskLevel: newRiskLevel,
    });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

