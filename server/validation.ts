import { z } from 'zod';
import { CRITERIA, MODEL_SLOTS } from './types.js';
import type { PersonaImageEvaluation } from './types.js';
import { calculateWeightedScore } from './rubric.js';

const criterionIds = CRITERIA.map((criterion) => criterion.id) as [string, ...string[]];
const scoreSchema = z.number().int().min(0).max(10);
const scoreRecord = z.record(z.enum(criterionIds), scoreSchema);
const reasoningRecord = z.record(z.enum(criterionIds), z.string().min(1).max(1000));

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

export function validatePersonaResponse(content: string, personaId: string): PersonaImageEvaluation[] {
  const parsed = parseJson(content);
  const candidate = Array.isArray(parsed) ? parsed : (parsed as { evaluations?: unknown }).evaluations;
  if (!Array.isArray(candidate) || candidate.length !== 3) throw new Error('Persona response must contain exactly three evaluations');

  const results = candidate.map((item) => providerSchema.parse(item)) as PersonaImageEvaluation[];
  const expectedIds = new Set(MODEL_SLOTS.map((slot) => slot.imageId));
  if (new Set(results.map((result) => result.image_id)).size !== 3 || results.some((result) => !expectedIds.has(result.image_id))) {
    throw new Error('Persona response must contain each image exactly once');
  }
  for (const result of results) {
    const slot = MODEL_SLOTS.find((item) => item.imageId === result.image_id);
    if (!slot || result.persona_id !== personaId || result.model_name !== slot.modelName) {
      throw new Error('Persona response identity does not match server context');
    }
    const computed = calculateWeightedScore(result.criterion_scores);
    if (Math.abs(computed - result.weighted_score) > 0.15) {
      throw new Error('Persona weighted score does not match criterion scores');
    }
    result.weighted_score = computed;
  }
  return results;
}
