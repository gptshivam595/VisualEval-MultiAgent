export const MODEL_SLOTS = [
  { imageId: 'image1', slot: 1, modelName: 'GPT-Image-2.5' },
  { imageId: 'image2', slot: 2, modelName: 'Nano Banana 2.1' },
  { imageId: 'image3', slot: 3, modelName: 'Nano Banana Pro' },
] as const;

export const CRITERIA = [
  { id: 'indianCulturalAuthenticity', label: 'Indian Cultural Authenticity', weight: 15 },
  { id: 'luxuryPremiumAppeal', label: 'Luxury & Premium Appeal', weight: 15 },
  { id: 'fashionStyling', label: 'Fashion & Styling', weight: 12 },
  { id: 'promptAdherence', label: 'Prompt Adherence', weight: 12 },
  { id: 'visualAesthetics', label: 'Visual Aesthetics', weight: 10 },
  { id: 'photorealismAuthenticity', label: 'Photorealism & Authenticity', weight: 10 },
  { id: 'indianSocialContext', label: 'Indian Social Context', weight: 8 },
  { id: 'craftsmanshipDetail', label: 'Craftsmanship & Detail', weight: 7 },
  { id: 'commercialBrandReadiness', label: 'Commercial / Brand Readiness', weight: 6 },
  { id: 'aiArtifactDetection', label: 'AI Artifact Detection', weight: 5 },
] as const;

export type CriterionId = (typeof CRITERIA)[number]['id'];
export type ImageId = (typeof MODEL_SLOTS)[number]['imageId'];
export type EvaluationStatus = 'completed' | 'completed_with_warnings' | 'failed';

export interface Persona {
  personaId: string;
  name: string;
  age: number;
  city: string;
  state: string;
  region: string;
  occupation: string;
  description: string;
  evaluationLens: string;
}

export interface PersonaImageEvaluation {
  persona_id: string;
  persona_name: string;
  image_id: ImageId;
  model_name: string;
  criterion_scores: Record<CriterionId, number>;
  criterion_reasoning: Record<CriterionId, string>;
  weighted_score: number;
  strengths: string[];
  concerns: string[];
  india_specific_observations: string[];
  confidence: number;
}

export interface FailedImageEvaluation {
  persona_id: string;
  persona_name: string;
  image_id: ImageId;
  model_name: string;
  status: 'failed';
  error_code: string;
  attempts: number;
}

export interface PersonaResult {
  persona_id: string;
  persona_name: string;
  status: 'valid' | 'partial' | 'failed';
  evaluations: PersonaImageEvaluation[];
  failed_evaluations: FailedImageEvaluation[];
  error_code: string | null;
}

export interface AggregateImageResult {
  image_id: ImageId;
  slot: number;
  model_name: string;
  overall_score: number | null;
  star_rating: number | null;
  rank: number | null;
  criterion_scores: Partial<Record<CriterionId, number>>;
  strengths: string[];
  weaknesses: string[];
  concerns: string[];
  india_specific_insights: string[];
  valid_persona_count: number;
}

export interface EvaluationResponse {
  schema_version: string;
  rubric_version: string;
  aggregation_version: string;
  run_id: string;
  status: EvaluationStatus;
  valid_persona_count: number;
  expected_persona_count: number;
  completed_image_evaluations: number;
  images: AggregateImageResult[];
  persona_results: PersonaResult[];
  overall_winner: ImageId | null;
  why: string;
  common_strengths: string[];
  common_concerns: string[];
  india_specific_insights: string[];
  agreement: string[];
  disagreement: string[];
  warnings: string[];
}
