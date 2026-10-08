import type { EvaluationResponse, ImageId, PersonaEvaluation, PersonaResult } from './types';

export const criteria = [
  ['indianCulturalAuthenticity', 'Indian Cultural Authenticity', 15],
  ['luxuryPremiumAppeal', 'Luxury & Premium Appeal', 15],
  ['fashionStyling', 'Fashion & Styling', 12],
  ['promptAdherence', 'Prompt Adherence', 12],
  ['visualAesthetics', 'Visual Aesthetics', 10],
  ['photorealismAuthenticity', 'Photorealism & Authenticity', 10],
  ['indianSocialContext', 'Indian Social Context', 8],
  ['craftsmanshipDetail', 'Craftsmanship & Detail', 7],
  ['commercialBrandReadiness', 'Commercial / Brand Readiness', 6],
  ['aiArtifactDetection', 'AI Artifact Detection', 5],
] as const;

function round(value: number): number {
  return Number(value.toFixed(2));
}

function weighted(scores: Record<string, number>): number {
  return round(criteria.reduce((sum, [id, , weight]) => sum + (scores[id] ?? 0) * weight, 0) / 100);
}

function topTerms(values: string[]): string[] {
  const counts = new Map<string, number>();
  values.forEach((value) => {
    const normalized = value.trim();
    if (normalized) counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([value, count]) => `${value} (${count})`);
}

export function aggregateClientResults(results: PersonaResult[]): EvaluationResponse {
  const slots = [
    ['image1', 1, 'GPT-Image-2.5'],
    ['image2', 2, 'Nano Banana 2.1'],
    ['image3', 3, 'Nano Banana Pro'],
  ] as const;
  const images = slots.map(([imageId, slot, modelName]) => {
    const evaluations = results.flatMap((persona) => persona.evaluations.filter((item) => item.image_id === imageId));
    if (!evaluations.length) return { image_id: imageId, slot, model_name: modelName, overall_score: null, star_rating: null, rank: null as number | null, criterion_scores: {}, strengths: [], weaknesses: [], concerns: [], india_specific_insights: [], valid_persona_count: 0 };
    const criterionScores = Object.fromEntries(criteria.map(([id]) => [id, round(evaluations.reduce((sum, item) => sum + item.criterion_scores[id], 0) / evaluations.length)]));
    const overall = weighted(criterionScores);
    return { image_id: imageId, slot, model_name: modelName, overall_score: overall, star_rating: Math.max(0, Math.min(5, Math.round(overall / 2))), rank: null as number | null, criterion_scores: criterionScores, strengths: topTerms(evaluations.flatMap((item) => item.strengths)), weaknesses: topTerms(evaluations.flatMap((item) => item.concerns)), concerns: topTerms(evaluations.flatMap((item) => item.concerns)), india_specific_insights: topTerms(evaluations.flatMap((item) => item.india_specific_observations)), valid_persona_count: evaluations.length };
  });
  const ranked = [...images].filter((item) => item.overall_score !== null).sort((a, b) => (b.overall_score ?? -1) - (a.overall_score ?? -1) || a.slot - b.slot);
  ranked.forEach((item, index) => { item.rank = index + 1; });
  const completed = results.reduce((sum, persona) => sum + persona.evaluations.length, 0);
  const contributing = new Set(results.filter((persona) => persona.evaluations.length > 0).map((persona) => persona.persona_id)).size;
  const winner = completed >= 21 ? ranked[0]?.image_id ?? null : null;
  return {
    status: completed === 30 ? 'completed' : completed >= 21 ? 'completed_with_warnings' : 'failed',
    valid_persona_count: contributing,
    expected_persona_count: 10,
    completed_image_evaluations: completed,
    images,
    persona_results: results,
    overall_winner: winner,
    why: winner ? `${images.find((item) => item.image_id === winner)?.model_name} leads on the deterministic aggregate of completed persona scores.` : 'No reliable winner is available because the minimum evaluation threshold was not met.',
    common_strengths: topTerms(images.flatMap((item) => item.strengths)),
    common_concerns: topTerms(images.flatMap((item) => item.concerns)),
    india_specific_insights: topTerms(images.flatMap((item) => item.india_specific_insights)),
    agreement: images.map((item) => `${item.model_name}: ${item.valid_persona_count} completed evaluations`),
    disagreement: contributing ? [`Review persona-level criterion scores across ${contributing} contributing personas.`] : [],
    warnings: results.flatMap((persona) => persona.failed_evaluations.map((failure) => `${persona.persona_name} / ${failure.model_name} failed: ${failure.error_code}`)),
  };
}

export type { ImageId, PersonaEvaluation };
