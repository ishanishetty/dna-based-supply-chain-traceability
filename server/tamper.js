import pool from './database.js';

async function tamper() {
    const arg1 = process.argv[2]; // Name or Batch
    const arg2 = process.argv[3]; // Optional second filter (Batch if arg1 is Name)
    const arg3 = process.argv[4]; // Optional custom DNA sequence

    console.log('--- DNA Trace Precision Tamper Tool (v5) ---');

    if (!arg1) {
        console.log('Usage:');
        console.log('  node tamper.js "Product Name" [Batch ID] [Custom DNA]');
        console.log('Examples:');
        console.log('  node tamper.js "Covid Vaccine" "VAC-2024-001" "ATCG-CUSTOM"');
        console.log('  node tamper.js "VAC-2024-001" "" "ATCG-SUBTLE"');

        console.log('\nRecent products with history:');
        try {
            const [available] = await pool.execute(
                `SELECT p.product_name, p.batch_number, p.manufacturer, MAX(h.mutation_timestamp) as last_event
         FROM DNA_HISTORY h 
         JOIN PRODUCT p ON h.product_id = p.product_id
         GROUP BY p.product_id
         ORDER BY last_event DESC LIMIT 10`
            );
            available.forEach(p => {
                console.log(` - ${p.product_name.padEnd(20)} | Batch: ${p.batch_number.padEnd(15)} | Mfg: ${p.manufacturer}`);
            });
        } catch (err) {
            console.error('List Error:', err.message);
        }
        process.exit(0);
    }

    try {
        let query, params;
        let customDna = arg3;

        // Logic to handle arguments flexibly
        // Case 1: node tamper "Name" "Batch" "DNA" -> arg1=Name, arg2=Batch, arg3=DNA
        // Case 2: node tamper "Batch" "" "DNA" -> arg1=Batch, arg2="", arg3=DNA
        // Case 3: node tamper "Name" "" "DNA" -> arg1=Name, arg2="", arg3=DNA

        // We search by Name AND Batch if both provided, else Name OR Batch
        if (arg1 && arg2 && arg2 !== "") {
            console.log(`Targeting: Name="${arg1}" AND Batch="${arg2}"...`);
            query = `
        SELECT h.history_id, h.mutated_dna, p.product_name, p.batch_number, p.manufacturer 
        FROM DNA_HISTORY h
        JOIN PRODUCT p ON h.product_id = p.product_id
        WHERE p.product_name = ? AND p.batch_number = ?
        ORDER BY h.mutation_timestamp DESC LIMIT 1`;
            params = [arg1, arg2];
        } else {
            console.log(`Searching for: "${arg1}"...`);
            query = `
        SELECT h.history_id, h.mutated_dna, p.product_name, p.batch_number, p.manufacturer 
        FROM DNA_HISTORY h
        JOIN PRODUCT p ON h.product_id = p.product_id
        WHERE p.product_name = ? OR p.batch_number = ?
        ORDER BY h.mutation_timestamp DESC`;
            params = [arg1, arg1];
        }

        const [rows] = await pool.execute(query, params);

        if (rows.length === 0) {
            console.log(`ERROR: No records found for your input.`);
            process.exit(1);
        }

        // Handle Ambiguity if only one argument was provided
        if (!arg2 || arg2 === "") {
            const distinctProducts = [...new Set(rows.map(r => `${r.product_name}|${r.batch_number}|${r.manufacturer}`))];
            if (distinctProducts.length > 1) {
                console.log(`\nAMBIGUITY DETECTED: Multiple products found for "${arg1}":`);
                distinctProducts.forEach((p, i) => {
                    const [name, batch, mfg] = p.split('|');
                    console.log(` [${i + 1}] Name: ${name} | Batch: ${batch} | Mfg: ${mfg}`);
                });
                console.log('\nFIX: Provide both Name and Batch ID.');
                console.log(`Example: node tamper.js "${rows[0].product_name}" "${rows[0].batch_number}"`);
                process.exit(0);
            }
        }

        const targetRow = rows[0];
        const targetId = targetRow.history_id;
        const currentDna = targetRow.mutated_dna;

        // Determine the tampered value
        let tamperedValue;
        if (customDna) {
            tamperedValue = customDna;
        } else {
            // Revert to the "TAMPERED-SEQ" behavior as requested
            tamperedValue = 'TAMPERED-SEQ-' + Math.floor(Math.random() * 10000);
        }

        console.log(`\nTARGET IDENTIFIED:`);
        console.log(`  Product: ${targetRow.product_name}`);
        console.log(`  Batch:   ${targetRow.batch_number}`);
        console.log(`  Current DNA:  ${currentDna}`);
        console.log(`  Tampered DNA: ${tamperedValue}`);

        // 2. Temporarily lift the immutability trigger
        console.log('\n[STEP 1] Lifting immutability triggers...');
        await pool.query('DROP TRIGGER IF EXISTS trg_prevent_update_dna_history');

        // 3. Perform the tamper
        console.log('[STEP 2] Performing unauthorized update...');
        await pool.execute(
            'UPDATE DNA_HISTORY SET mutated_dna = ? WHERE history_id = ?',
            [tamperedValue, targetId]
        );
        console.log(`SUCCESS: Record tampered.`);

        // 4. Restore the trigger
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

        console.log('\n--- TAMPER COMPLETE ---');
        console.log(`Check Batch ${targetRow.batch_number} in the UI.`);
        process.exit(0);
    } catch (error) {
        console.error('\nTamper Tool Error:', error.message);
        try { await pool.query(`CREATE TRIGGER IF NOT EXISTS trg_prevent_update_dna_history BEFORE UPDATE ON DNA_HISTORY FOR EACH ROW BEGIN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Immutability Violation: Mutation history records cannot be modified.'; END`); } catch (e) { }
        process.exit(1);
    }
}

tamper();
