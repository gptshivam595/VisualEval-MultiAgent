import type { Persona } from './types.js';
import { getGroqModel, GROQ_API_ENDPOINT } from './groq-config.js';

export interface ProviderContext {
  images: Array<{ imageId: string; modelName: string; mimeType: string; dataUrl: string }>;
  rubric: string;
}

export interface RawPersonaResponse {
  content: string;
}

export interface LlmProvider {
  evaluatePersona(context: ProviderContext, persona: Persona): Promise<RawPersonaResponse>;
}

export class GroqRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number | null,
    public readonly providerCode: string | null,
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = 'GroqRequestError';
  }
}

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const groqProvider: LlmProvider = {
  async evaluatePersona(context, persona) {
    const apiKey = getEnv('GROQ_API_KEY');
    const model = getGroqModel();
    const imageContent = context.images.flatMap((image) => [
      { type: 'text', text: `${image.imageId} is permanently associated with ${image.modelName}. Evaluate the image independently; do not compare it to other images.` },
      { type: 'image_url', image_url: { url: image.dataUrl } },
    ]);

    const system = [
      'You are one simulated Indian fashion-evaluation persona in a pre-evaluation study.',
      'You are not a real person and must not claim to represent a city, region, or population.',
      'Evaluate each image independently. Do not rank or compare images.',
      'Return only valid JSON with no markdown, no code fences, and no commentary outside JSON.',
      'Use exactly the supplied criterion IDs and score each from 0 to 10.',
      'Provide concise evidence for every criterion, strengths, concerns, India-specific observations, and confidence from 0 to 1.',
      'Return a JSON object with an evaluations array containing exactly three objects, one for image1, image2, and image3. Every object must contain exactly these fields: persona_id, persona_name, image_id, model_name, criterion_scores, criterion_reasoning, weighted_score, strengths, concerns, india_specific_observations, confidence.',
      'criterion_scores and criterion_reasoning must contain every supplied criterion ID. weighted_score must be the weighted 0-10 calculation from criterion_scores.',
      `Persona: ${persona.name}. Context: ${persona.description}. Evaluation lens: ${persona.evaluationLens}.`,
      `Rubric:\n${context.rubric}`,
    ].join('\n\n');

    const requestBody = {
      model,
      temperature: 0.2,
      max_completion_tokens: 5000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: imageContent },
      ],
    };

    try {
      const response = await fetch(GROQ_API_ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(90_000),
      });
      const payload = await response.json().catch(() => null) as {
        choices?: Array<{ message?: { content?: string } }>;
        error?: { message?: string; type?: string; code?: string };
      } | null;

      if (!response.ok) {
        const detail = payload?.error?.message ?? `HTTP ${response.status}`;
        const providerCode = payload?.error?.code ?? payload?.error?.type ?? null;
        const retryable = response.status === 408 || response.status === 409 || response.status === 429 || response.status >= 500;
        console.error('[groq] request failed', {
          status: response.status,
          model,
          providerCode,
          detail,
          retryable,
        });
        throw new GroqRequestError(`Groq request failed (${response.status}): ${detail}`, response.status, providerCode, retryable);
      }

      const content = payload?.choices?.[0]?.message?.content;
      if (!content) {
        console.error('[groq] response contained no message content', { status: response.status, model });
        throw new GroqRequestError('Groq returned an empty response', response.status, null, false);
      }
      return { content };
    } catch (error) {
      if (error instanceof GroqRequestError) throw error;
      const detail = error instanceof Error ? error.message : 'network error';
      console.error('[groq] transport error', { model, detail });
      throw new GroqRequestError(`Groq transport error: ${detail}`, null, null, true);
    }
  },
};
