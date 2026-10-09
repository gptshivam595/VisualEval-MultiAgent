import { aggregateResults } from '../server/aggregate';
import { CRITERIA } from '../server/types';
import type { PersonaResult as ServerPersonaResult } from '../server/types';
import type { EvaluationResponse, PersonaResult } from './types';

export const criteria = CRITERIA.map(({ id, label, weight }) => [id, label, weight] as const);

export function aggregateClientResults(results: PersonaResult[]): EvaluationResponse {
  return aggregateResults(crypto.randomUUID(), results as ServerPersonaResult[]);
}
