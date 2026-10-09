import type { Persona } from './types.js';

export const PERSONAS: Persona[] = [
  { personaId: 'north-delhi-brand-strategist', name: 'Aditi Mehra', age: 29, city: 'New Delhi', state: 'Delhi', region: 'North India', occupation: 'Brand strategist', description: 'Urban, culturally curious premium shopper with experience in consumer and lifestyle brands.', evaluationLens: 'Brand point of view, cultural nuance, premium coherence, and commercial brand trust.' },
];

if (PERSONAS.length !== 1 || new Set(PERSONAS.map((persona) => persona.personaId)).size !== 1) {
  throw new Error('Exactly one evaluation persona is required.');
}
