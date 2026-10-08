import { CRITERIA } from './types.js';

if (CRITERIA.reduce((sum, criterion) => sum + criterion.weight, 0) !== 100) {
  throw new Error('Evaluation criteria weights must total 100%.');
}

export const RUBRIC_VERSION = '1.0';
export const AGGREGATION_VERSION = '1.0';

export const rubricText = CRITERIA.map(
  (criterion) => `${criterion.label} (${criterion.id}): score 0-10, weight ${criterion.weight}%.`,
).join('\n');

export function calculateWeightedScore(scores: Record<string, number>): number {
  return Number(
    CRITERIA.reduce((total, criterion) => total + (scores[criterion.id] ?? 0) * criterion.weight, 0) / 100,
  );
}
