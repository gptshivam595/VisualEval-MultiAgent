import { PERSONAS } from './personas.js';
import { AGGREGATION_VERSION, calculateWeightedScore } from './rubric.js';
import { CRITERIA, MODEL_SLOTS } from './types.js';
import type { AggregateImageResult, EvaluationResponse, PersonaResult } from './types.js';

const EXPECTED_EVALUATIONS = PERSONAS.length * MODEL_SLOTS.length;

function round(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function starRating(score: number): number {
  return Math.max(0, Math.min(5, Math.round(score / 2)));
}

function topTerms(values: string[], limit = 5): string[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    const key = value.trim();
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([value, count]) => `${value} (${count})`);
}

export function aggregateResults(runId: string, personaResults: PersonaResult[]): EvaluationResponse {
  const completedImageEvaluations = personaResults.reduce((sum, result) => sum + result.evaluations.length, 0);
  const status = completedImageEvaluations === EXPECTED_EVALUATIONS ? 'completed' : completedImageEvaluations > 0 ? 'completed_with_warnings' : 'failed';
  const images: AggregateImageResult[] = MODEL_SLOTS.map((slot) => {
    const evaluations = personaResults.flatMap((persona) => persona.evaluations.filter((evaluation) => evaluation.image_id === slot.imageId));
    if (!evaluations.length) {
      return { image_id: slot.imageId, slot: slot.slot, model_name: slot.modelName, overall_score: null, star_rating: null, rank: null, criterion_scores: {}, strengths: [], weaknesses: [], concerns: [], india_specific_insights: [], valid_persona_count: 0 };
    }
    const criterionScores = Object.fromEntries(CRITERIA.map((criterion) => [
      criterion.id,
      round(evaluations.reduce((sum, evaluation) => sum + evaluation.criterion_scores[criterion.id], 0) / evaluations.length),
    ]));
    const overall = calculateWeightedScore(criterionScores);
    return {
      image_id: slot.imageId,
      slot: slot.slot,
      model_name: slot.modelName,
      overall_score: round(overall),
      star_rating: starRating(overall),
      rank: null,
      criterion_scores: criterionScores,
      strengths: topTerms(evaluations.flatMap((evaluation) => evaluation.strengths)),
      weaknesses: topTerms(evaluations.flatMap((evaluation) => evaluation.concerns)),
      concerns: topTerms(evaluations.flatMap((evaluation) => evaluation.concerns)),
      india_specific_insights: topTerms(evaluations.flatMap((evaluation) => evaluation.india_specific_observations)),
      valid_persona_count: evaluations.length,
    };
  });

  const ranked = [...images].filter((image) => image.overall_score !== null).sort((a, b) => {
    const score = (b.overall_score ?? -1) - (a.overall_score ?? -1);
    if (score !== 0) return score;
    const commercial = (b.criterion_scores.commercialBrandReadiness ?? -1) - (a.criterion_scores.commercialBrandReadiness ?? -1);
    if (commercial !== 0) return commercial;
    const premium = (b.criterion_scores.luxuryPremiumAppeal ?? -1) - (a.criterion_scores.luxuryPremiumAppeal ?? -1);
    return premium !== 0 ? premium : a.slot - b.slot;
  });
  ranked.forEach((image, index) => { image.rank = index + 1; });
  const winner = status === 'completed' ? ranked[0]?.image_id ?? null : null;
  const warnings = personaResults.flatMap((result) => result.failed_evaluations.map((failure) => `${result.persona_name} / ${failure.model_name} failed: ${failure.error_code}`));
  const commonStrengths = topTerms(images.flatMap((image) => image.strengths));
  const commonConcerns = topTerms(images.flatMap((image) => image.concerns));
  const insights = topTerms(images.flatMap((image) => image.india_specific_insights));
  const agreement = images.flatMap((image) => image.criterion_scores.commercialBrandReadiness !== undefined ? [`${image.model_name}: valid-persona count ${image.valid_persona_count}`] : []);
  const contributingPersonas = new Set(personaResults.filter((result) => result.evaluations.length > 0).map((result) => result.persona_id)).size;
  const disagreement = contributingPersonas ? [`Disagreement should be inspected in persona-level criterion scores; ${contributingPersonas} personas contributed valid image evaluations.`] : [];
  const why = winner ? `${images.find((image) => image.image_id === winner)?.model_name} leads on the deterministic aggregate of valid persona scores.` : 'No winner is declared until both personas have evaluated all three images.';

  return {
    schema_version: '1.0',
    rubric_version: '1.0',
    aggregation_version: AGGREGATION_VERSION,
    run_id: runId,
    status,
    valid_persona_count: contributingPersonas,
    expected_persona_count: PERSONAS.length,
    completed_image_evaluations: completedImageEvaluations,
    images,
    persona_results: personaResults,
    overall_winner: winner,
    why,
    common_strengths: commonStrengths,
    common_concerns: commonConcerns,
    india_specific_insights: insights,
    agreement,
    disagreement,
    warnings,
  };
}
