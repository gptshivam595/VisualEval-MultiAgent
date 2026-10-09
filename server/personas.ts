import type { Persona } from './types.js';

export const PERSONAS: Persona[] = [
  { personaId: 'north-delhi-brand-strategist', name: 'Aditi Mehra', age: 29, city: 'New Delhi', state: 'Delhi', region: 'North India', occupation: 'Brand strategist', description: 'Urban, culturally curious premium shopper with experience in consumer and lifestyle brands.', evaluationLens: 'Brand point of view, cultural nuance, premium coherence, and commercial brand trust.' },
  { personaId: 'west-ahmedabad-textile-professional', name: 'Devika Shah', age: 42, city: 'Ahmedabad', state: 'Gujarat', region: 'West India', occupation: 'Textile sourcing professional', description: 'Craft and product-development specialist attentive to fabric behavior and finishing.', evaluationLens: 'Construction, textile behavior, finishing, craft integrity, and material credibility.' },
];

if (PERSONAS.length !== 2 || new Set(PERSONAS.map((persona) => persona.personaId)).size !== 2) {
  throw new Error('Exactly two unique personas are required.');
}
