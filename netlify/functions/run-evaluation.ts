import type { Handler } from '@netlify/functions';
import { parse } from 'parse-multipart-data';
import { PERSONAS } from '../../server/personas.js';
import { rubricText } from '../../server/rubric.js';
import { GroqRequestError, groqProvider } from '../../server/provider.js';
import { MODEL_SLOTS } from '../../server/types.js';
import type { FailedImageEvaluation, PersonaImageEvaluation, PersonaResult } from '../../server/types.js';
import { validatePersonaImageResponse } from '../../server/validation.js';
import { aggregateResults } from '../../server/aggregate.js';

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_BYTES = 24 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const BATCH_SIZE = 2;
const BATCH_DELAY_MS = 1_500;
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 2_000;
const MAX_BACKOFF_MS = 30_000;
let activeEvaluation = false;

class EvaluationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EvaluationValidationError';
  }
}

function json(statusCode: number, body: unknown) {
  return { statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitteredBackoff(attempt: number): number {
  const exponential = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * (2 ** (attempt - 1)));
  return Math.round(exponential * (0.75 + Math.random() * 0.5));
}

function safePersonaError(error: unknown): string {
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

function decodeBody(event: Parameters<Handler>[0]): Buffer {
  if (!event.body) throw new Error('Empty request body');
  return Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
}

async function evaluateWithRetry(
  image: (typeof MODEL_SLOTS)[number],
  persona: (typeof PERSONAS)[number],
  input: { imageId: string; modelName: string; mimeType: string; dataUrl: string },
  completedCount: () => number,
): Promise<{ evaluation: PersonaImageEvaluation | null; failure: FailedImageEvaluation | null }> {
  let lastError: unknown;
  let attempts = 0;
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt += 1) {
    attempts = attempt;
    try {
      console.info('[evaluation] attempt', {
        persona: persona.name,
        image: image.imageId,
        model: image.modelName,
        attempt,
        completedCount: completedCount(),
      });
      const raw = await groqProvider.evaluatePersonaImage({ image: input, rubric: rubricText }, persona);
      let evaluation: PersonaImageEvaluation;
      try {
        evaluation = validatePersonaImageResponse(raw.content, persona.personaId, image.imageId, image.modelName);
      } catch (error) {
        throw new EvaluationValidationError(error instanceof Error ? error.message : 'invalid_persona_response');
      }
      console.info('[evaluation] completed', {
        persona: persona.name,
        image: image.imageId,
        model: image.modelName,
        attempt,
        completedCount: completedCount() + 1,
      });
      return { evaluation, failure: null };
    } catch (error) {
      lastError = error;
      const retryable = error instanceof GroqRequestError ? error.retryable : error instanceof EvaluationValidationError;
      if (!retryable || attempt > MAX_RETRIES) break;
      const providerDelay = error instanceof GroqRequestError ? error.retryAfterMs : null;
      const delay = Math.min(MAX_BACKOFF_MS, providerDelay ?? jitteredBackoff(attempt));
      console.warn('[evaluation] retrying', {
        persona: persona.name,
        image: image.imageId,
        model: image.modelName,
        attempt,
        status: error instanceof GroqRequestError ? error.status : null,
        retryDelayMs: delay,
        completedCount: completedCount(),
      });
      await sleep(delay);
    }
  }

  const errorCode = safePersonaError(lastError);
  console.error('[evaluation] failed', {
    persona: persona.name,
    image: image.imageId,
    model: image.modelName,
    attempts,
    status: lastError instanceof GroqRequestError ? lastError.status : null,
    errorCode,
    completedCount: completedCount(),
  });
  return {
    evaluation: null,
    failure: {
      persona_id: persona.personaId,
      persona_name: persona.name,
      image_id: image.imageId,
      model_name: image.modelName,
      status: 'failed',
      error_code: errorCode,
      attempts,
    },
  };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (activeEvaluation) return json(409, { error: 'evaluation_already_running', message: 'An evaluation is already running. Please wait for it to finish.' });
  activeEvaluation = true;

  try {
    const body = decodeBody(event);
    if (body.byteLength > MAX_TOTAL_BYTES) return json(413, { error: 'request_too_large' });
    const contentType = event.headers['content-type'] ?? event.headers['Content-Type'] ?? '';
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    const boundary = boundaryMatch?.[1] ?? boundaryMatch?.[2];
    if (!boundary) return json(400, { error: 'multipart_boundary_missing' });
    const parts = parse(body, boundary);
    const expected = new Map<string, (typeof MODEL_SLOTS)[number]>(MODEL_SLOTS.map((slot) => [slot.imageId, slot]));
    if (parts.length !== 3 || new Set(parts.map((part) => part.name)).size !== 3 || parts.some((part) => !part.name || !expected.has(part.name))) {
      return json(400, { error: 'exactly_three_fixed_images_required' });
    }
    const images = parts.map((part) => {
      if (!ALLOWED_TYPES.has(part.type) || part.data.length > MAX_FILE_BYTES) throw new Error('invalid_image');
      const slot = expected.get(part.name as 'image1' | 'image2' | 'image3')!;
      return { imageId: slot.imageId, modelName: slot.modelName, mimeType: part.type, dataUrl: `data:${part.type};base64,${part.data.toString('base64')}` };
    });
    const jobs = PERSONAS.flatMap((persona) => MODEL_SLOTS.map((image) => ({ persona, image, input: images.find((candidate) => candidate.imageId === image.imageId)! })));
    if (jobs.length !== 30) throw new Error('evaluation_job_count_mismatch');
    const evaluations = new Map<string, PersonaImageEvaluation>();
    const failures = new Map<string, FailedImageEvaluation>();
    let completedCount = 0;
    for (let batchStart = 0; batchStart < jobs.length; batchStart += BATCH_SIZE) {
      const batch = jobs.slice(batchStart, batchStart + BATCH_SIZE);
      await Promise.all(batch.map(async (job) => {
        const result = await evaluateWithRetry(job.image, job.persona, job.input, () => completedCount);
        if (result.evaluation) {
          evaluations.set(`${job.persona.personaId}:${job.image.imageId}`, result.evaluation);
          completedCount += 1;
        }
        if (result.failure) failures.set(`${job.persona.personaId}:${job.image.imageId}`, result.failure);
      }));
      if (batchStart + BATCH_SIZE < jobs.length) {
        console.info('[evaluation] batch complete', { completedCount, total: jobs.length, nextBatchDelayMs: BATCH_DELAY_MS });
        await sleep(BATCH_DELAY_MS);
      }
    }
    const results: PersonaResult[] = PERSONAS.map((persona) => {
      const personaEvaluations = MODEL_SLOTS.map((image) => evaluations.get(`${persona.personaId}:${image.imageId}`)).filter((evaluation): evaluation is PersonaImageEvaluation => Boolean(evaluation));
      const failedEvaluations = MODEL_SLOTS.map((image) => failures.get(`${persona.personaId}:${image.imageId}`)).filter((failure): failure is FailedImageEvaluation => Boolean(failure));
      return {
        persona_id: persona.personaId,
        persona_name: persona.name,
        status: personaEvaluations.length === 3 ? 'valid' : personaEvaluations.length > 0 ? 'partial' : 'failed',
        evaluations: personaEvaluations,
        failed_evaluations: failedEvaluations,
        error_code: failedEvaluations[0]?.error_code ?? null,
      };
    });
    return json(200, aggregateResults(crypto.randomUUID(), results));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'evaluation_failed';
    return json(message === 'invalid_image' ? 400 : 500, { error: message === 'invalid_image' ? 'invalid_image' : 'evaluation_failed' });
  } finally {
    activeEvaluation = false;
  }
};
