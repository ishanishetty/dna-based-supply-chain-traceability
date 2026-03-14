// DNA Generation and Mutation Logic

const DNA_BASES = ['A', 'T', 'C', 'G'] as const;
export type DNABase = typeof DNA_BASES[number];

export type EventType = 'delay' | 'quality_issue' | 'temperature_violation' | 'reroute';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

// Generate random 8-base DNA sequence
export function generateInitialDNA(): string {
  let dna = '';
  for (let i = 0; i < 8; i++) {
    dna += DNA_BASES[Math.floor(Math.random() * DNA_BASES.length)];
  }
  return dna;
}

// Apply mutation based on event type
export function applyMutation(dna: string, eventType: EventType): string {
  let mutatedDNA = dna;
  
  switch (eventType) {
    case 'delay':
      // Replace first G → T
      mutatedDNA = dna.replace('G', 'T');
      break;
    case 'quality_issue':
      // Replace first A → C
      mutatedDNA = dna.replace('A', 'C');
      break;
    case 'temperature_violation':
      // Append AG
      mutatedDNA = dna + 'AG';
      break;
    case 'reroute':
      // Insert C at index 2
      mutatedDNA = dna.slice(0, 2) + 'C' + dna.slice(2);
      break;
  }
  
  return mutatedDNA;
}

// Health impact per event type
export const HEALTH_IMPACT: Record<EventType, number> = {
  delay: -10,
  quality_issue: -25,
  temperature_violation: -40,
  reroute: -5,
};

// Calculate new health after event
export function calculateHealth(currentHealth: number, eventType: EventType): number {
  const newHealth = currentHealth + HEALTH_IMPACT[eventType];
  return Math.max(0, Math.min(100, newHealth));
}

// Determine risk level based on health
export function getRiskLevel(health: number): RiskLevel {
  if (health > 70) return 'LOW';
  if (health >= 40) return 'MEDIUM';
  return 'HIGH';
}

// Event type display names
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  delay: 'Delay',
  quality_issue: 'Quality Issue',
  temperature_violation: 'Temperature Violation',
  reroute: 'Reroute',
};

// Event type descriptions
export const EVENT_TYPE_DESCRIPTIONS: Record<EventType, string> = {
  delay: 'Shipment delayed in transit (G→T mutation)',
  quality_issue: 'Quality control failure detected (A→C mutation)',
  temperature_violation: 'Temperature threshold exceeded (+AG append)',
  reroute: 'Route changed unexpectedly (+C insertion)',
};
