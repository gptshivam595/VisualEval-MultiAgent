import type { Handler } from '@netlify/functions';
import { parse } from 'parse-multipart-data';
import { PERSONAS } from '../../server/personas.js';
import { rubricText } from '../../server/rubric.js';
import { groqProvider } from '../../server/provider.js';
import { MODEL_SLOTS } from '../../server/types.js';
import type { PersonaResult } from '../../server/types.js';
import { validatePersonaResponse } from '../../server/validation.js';
import { aggregateResults } from '../../server/aggregate.js';

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_BYTES = 24 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

function json(statusCode: number, body: unknown) {
  return { statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) };
}

function decodeBody(event: Parameters<Handler>[0]): Buffer {
  if (!event.body) throw new Error('Empty request body');
  return Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method_not_allowed' });
  try {
    const body = decodeBody(event);
    if (body.byteLength > MAX_TOTAL_BYTES) return json(413, { error: 'request_too_large' });
    const contentType = event.headers['content-type'] ?? event.headers['Content-Type'] ?? '';
    const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i)?.[1] ?? contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i)?.[2];
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
    const runId = crypto.randomUUID();
    const results: PersonaResult[] = [];
    const queue = [...PERSONAS];
    const worker = async () => {
      while (queue.length) {
        const persona = queue.shift();
        if (!persona) return;
        try {
          let parsed;
          try {
            const raw = await groqProvider.evaluatePersona({ images, rubric: rubricText }, persona);
            parsed = validatePersonaResponse(raw.content, persona.personaId);
          } catch {
            const raw = await groqProvider.evaluatePersona({ images, rubric: rubricText }, persona);
            parsed = validatePersonaResponse(raw.content, persona.personaId);
          }
          results.push({ persona_id: persona.personaId, persona_name: persona.name, status: 'valid', evaluations: parsed, error_code: null });
        } catch (error) {
          results.push({ persona_id: persona.personaId, persona_name: persona.name, status: 'failed', evaluations: [], error_code: error instanceof Error ? error.message.slice(0, 120) : 'evaluation_failed' });
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(4, PERSONAS.length) }, () => worker()));
    return json(200, aggregateResults(runId, results.sort((a, b) => a.persona_id.localeCompare(b.persona_id))));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'evaluation_failed';
    const status = message === 'invalid_image' ? 400 : message.includes('GROQ_API_KEY') ? 500 : 500;
    return json(status, { error: message === 'invalid_image' ? 'invalid_image' : 'evaluation_failed' });
  }
};
