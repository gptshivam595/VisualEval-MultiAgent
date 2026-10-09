import { z } from 'zod';
import { CRITERIA } from './types.js';
import type { PersonaImageEvaluation } from './types.js';
import { calculateWeightedScore } from './rubric.js';

const criterionIds = CRITERIA.map((criterion) => criterion.id) as [string, ...string[]];
const scoreSchema = z.number().int().min(0).max(10);
const scoreRecord = z.object(Object.fromEntries(criterionIds.map((id) => [id, scoreSchema]))).strict();
const reasoningRecord = z.object(Object.fromEntries(criterionIds.map((id) => [id, z.string().trim().min(1).max(1000)]))).strict();

const providerSchema = z.object({
  persona_id: z.string(),
  persona_name: z.string(),
  image_id: z.enum(['image1', 'image2', 'image3']),
  model_name: z.string(),
  criterion_scores: scoreRecord,
  criterion_reasoning: reasoningRecord,
  weighted_score: z.number().min(0).max(10),
  strengths: z.array(z.string().min(1).max(300)).max(8),
  concerns: z.array(z.string().min(1).max(300)).max(8),
  india_specific_observations: z.array(z.string().min(1).max(500)).max(8),
  confidence: z.number().min(0).max(1),
});

function parseJson(content: string): unknown {
  const trimmed = content.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
    throw new Error('Invalid JSON');
  }
}

export function validatePersonaImageResponse(content: string, personaId: string, imageId: 'image1' | 'image2' | 'image3', modelName: string): PersonaImageEvaluation {
  const parsed = parseJson(content);
  const candidate = (parsed as { evaluation?: unknown }).evaluation ?? parsed;
  const result = providerSchema.parse(candidate) as PersonaImageEvaluation;
  if (result.image_id !== imageId || result.persona_id !== personaId || result.model_name !== modelName) {
    throw new Error('Persona response identity does not match server context');
  }
  const computed = calculateWeightedScore(result.criterion_scores);
  if (Math.abs(computed - result.weighted_score) > 0.15) {
    throw new Error('Persona weighted score does not match criterion scores');
  }
  result.weighted_score = computed;
  return result;
}
