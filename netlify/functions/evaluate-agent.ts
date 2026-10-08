import type { Handler } from '@netlify/functions';
import { PERSONAS } from '../../server/personas.js';
import { rubricText } from '../../server/rubric.js';
import { GroqRequestError, groqProvider } from '../../server/provider.js';
import { MODEL_SLOTS } from '../../server/types.js';
import type { PersonaImageEvaluation } from '../../server/types.js';
import { validatePersonaImageResponse } from '../../server/validation.js';

const MAX_RETRIES = 3;
const MAX_IMAGE_DATA_URL_LENGTH = 12 * 1024 * 1024;

class EvaluationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EvaluationValidationError';
  }
}

function response(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body),
  };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoff(attempt: number): number {
  const base = Math.min(30_000, 2_000 * (2 ** (attempt - 1)));
  return Math.round(base * (0.75 + Math.random() * 0.5));
}

function errorCode(error: unknown): string {
  if (error instanceof GroqRequestError) {
    if (error.status === 404) return 'provider_model_unavailable';
    if (error.status === 401 || error.status === 403) return 'provider_authentication_failed';
    if (error.status === 429) return 'provider_rate_limited';
    if (error.status !== null && error.status >= 500) return 'provider_temporarily_unavailable';
    if (error.status === null) return 'provider_network_error';
    return 'provider_request_failed';
  }
  if (error instanceof Error && error.message === 'Invalid JSON') return 'malformed_provider_json';
  if (error instanceof Error && error.message.includes('Persona response')) return 'invalid_persona_response';
  if (error instanceof Error && error.message.includes('GROQ_API_KEY')) return 'server_provider_configuration_missing';
  return 'evaluation_failed';
}

function findPersona(personaId: unknown) {
  return PERSONAS.find((persona) => persona.personaId === personaId);
}

function findImage(imageId: unknown) {
  return MODEL_SLOTS.find((image) => image.imageId === imageId);
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return response(405, { success: false, error: 'method_not_allowed' });

  try {
    const body = JSON.parse(event.body ?? '{}') as {
      personaId?: unknown;
      imageId?: unknown;
      modelName?: unknown;
      mimeType?: unknown;
      dataUrl?: unknown;
    };
    const persona = findPersona(body.personaId);
    const image = findImage(body.imageId);
    if (!persona || !image || body.modelName !== image.modelName || typeof body.dataUrl !== 'string' || typeof body.mimeType !== 'string') {
      return response(400, { success: false, error: 'invalid_evaluation_job' });
    }
    if (!body.dataUrl.startsWith(`data:${body.mimeType};base64,`) || body.dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
      return response(400, { success: false, error: 'invalid_image_data' });
    }

    let lastError: unknown;
    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt += 1) {
      try {
        const raw = await groqProvider.evaluatePersonaImage({
          image: { imageId: image.imageId, modelName: image.modelName, mimeType: body.mimeType, dataUrl: body.dataUrl },
          rubric: rubricText,
        }, persona);
        let evaluation: PersonaImageEvaluation;
        try {
          evaluation = validatePersonaImageResponse(raw.content, persona.personaId, image.imageId, image.modelName);
        } catch (error) {
          throw new EvaluationValidationError(error instanceof Error ? error.message : 'invalid_persona_response');
        }
        console.info('[evaluate-agent] completed', { persona: persona.name, image: image.imageId, model: image.modelName, attempt });
        return response(200, {
          success: true,
          personaId: persona.personaId,
          imageId: image.imageId,
          modelName: image.modelName,
          evaluation,
        });
      } catch (error) {
        lastError = error;
        const retryable = error instanceof GroqRequestError ? error.retryable : error instanceof EvaluationValidationError;
        if (!retryable || attempt > MAX_RETRIES) break;
        const retryAfter = error instanceof GroqRequestError ? error.retryAfterMs : null;
        const delay = Math.min(30_000, retryAfter ?? backoff(attempt));
        console.warn('[evaluate-agent] retrying', {
          persona: persona.name,
          image: image.imageId,
          model: image.modelName,
          attempt,
          status: error instanceof GroqRequestError ? error.status : null,
          retryDelayMs: delay,
        });
        await wait(delay);
      }
    }
    const code = errorCode(lastError);
    console.error('[evaluate-agent] failed', {
      persona: persona.name,
      image: image.imageId,
      model: image.modelName,
      attempts: MAX_RETRIES + 1,
      status: lastError instanceof GroqRequestError ? lastError.status : null,
      errorCode: code,
    });
    return response(502, { success: false, personaId: persona.personaId, imageId: image.imageId, modelName: image.modelName, error: code });
  } catch (error) {
    console.error('[evaluate-agent] invalid request', { detail: error instanceof Error ? error.message : 'unknown error' });
    return response(400, { success: false, error: 'invalid_json_request' });
  }
};
