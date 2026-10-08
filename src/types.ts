export type ImageId = 'image1' | 'image2' | 'image3';
export interface ImageSlot { imageId: ImageId; slot: number; modelName: string; file: File | null; previewUrl: string | null; error: string | null; }
export interface Persona { persona_id: string; persona_name: string; city: string; state?: string; region: string; occupation?: string; description?: string; status?: string; }
export interface PersonaEvaluation { image_id: ImageId; model_name: string; criterion_scores: Record<string, number>; criterion_reasoning: Record<string, string>; weighted_score: number; strengths: string[]; concerns: string[]; india_specific_observations: string[]; confidence: number; persona_id?: string; persona_name?: string; }
export interface FailedEvaluation { image_id: ImageId; model_name: string; error_code: string; attempts: number; }
export interface PersonaResult { persona_id: string; persona_name: string; status: 'valid' | 'partial' | 'failed'; evaluations: PersonaEvaluation[]; failed_evaluations: FailedEvaluation[]; error_code: string | null; }
export interface EvaluationResponse {
  status: 'completed' | 'completed_with_warnings' | 'failed';
  valid_persona_count: number;
  expected_persona_count: number;
  completed_image_evaluations: number;
  images: Array<{ image_id: ImageId; slot: number; model_name: string; overall_score: number | null; star_rating: number | null; rank: number | null; criterion_scores: Record<string, number>; strengths: string[]; weaknesses: string[]; concerns: string[]; india_specific_insights: string[]; valid_persona_count: number; }>;
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
