// DNA Generation and Mutation Logic (shared with frontend)

const DNA_BASES = ['A', 'T', 'C', 'G'];

export function generateInitialDNA() {
  let dna = '';
  for (let i = 0; i < 8; i++) {
    dna += DNA_BASES[Math.floor(Math.random() * DNA_BASES.length)];
  }
  return dna;
}

export function applyMutation(dna, eventType) {
  let mutatedDNA = dna;
  
  switch (eventType) {
    case 'delay':
      mutatedDNA = dna.replace('G', 'T');
      break;
    case 'quality_issue':
      mutatedDNA = dna.replace('A', 'C');
      break;
    case 'temperature_violation':
      mutatedDNA = dna + 'AG';
      break;
    case 'reroute':
      mutatedDNA = dna.slice(0, 2) + 'C' + dna.slice(2);
      break;
  }
  
  return mutatedDNA;
}

export const HEALTH_IMPACT = {
  delay: -10,
  quality_issue: -25,
  temperature_violation: -40,
  reroute: -5,
};

export function calculateHealth(currentHealth, eventType) {
  const newHealth = currentHealth + HEALTH_IMPACT[eventType];
  return Math.max(0, Math.min(100, newHealth));
}

export function getRiskLevel(health) {
  if (health > 70) return 'LOW';
  if (health >= 40) return 'MEDIUM';
  return 'HIGH';
}

