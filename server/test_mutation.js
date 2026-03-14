import { applyMutation, calculateHealth, getRiskLevel } from './lib/dna.js';

console.log('--- Testing DNA Mutation Logic ---');

const initialDNA = 'ATCGATCG';
console.log(`Initial DNA: ${initialDNA}`);

const events = ['delay', 'quality_issue', 'temperature_violation', 'reroute'];

events.forEach(event => {
    const mutated = applyMutation(initialDNA, event);
    const health = calculateHealth(100, event);
    const risk = getRiskLevel(health);

    console.log(`\nEvent: ${event}`);
    console.log(`  Mutated DNA: ${mutated} (Original: ${initialDNA})`);
    console.log(`  New Health:  ${health}`);
    console.log(`  Risk Level:  ${risk}`);

    // Check if change occurred
    if (mutated === initialDNA) {
        console.warn('  [WARNING] No DNA change detected! (might be due to missing base in sequence)');
    }
});
