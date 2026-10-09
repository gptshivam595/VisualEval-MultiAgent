import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const cache = new Map();
function load(filename) {
  const file = path.resolve(filename);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const localRequire = (id) => {
    if (!id.startsWith('.')) return require(id);
    const target = id.endsWith('.js') ? id.slice(0, -3) + '.ts' : id + '.ts';
    return load(path.resolve(path.dirname(file), target));
  };
  new Function('require', 'module', 'exports', source)(localRequire, module, module.exports);
  return module.exports;
}

const { PERSONAS } = load('server/personas.ts');
const { CRITERIA, MODEL_SLOTS } = load('server/types.ts');
const { validatePersonaImageResponse } = load('server/validation.ts');
const { aggregateResults } = load('server/aggregate.ts');
const { groqProvider, GroqRequestError } = load('server/provider.ts');
const { handler } = load('netlify/functions/evaluate-agent.ts');
const { ApiError, readApiResponse } = load('src/api.ts');
const { evaluateWithCooldown } = load('src/evaluation-queue.ts');

function evaluation(persona, slot) {
  return {
    persona_id: persona.personaId, persona_name: persona.name,
    image_id: slot.imageId, model_name: slot.modelName,
    criterion_scores: Object.fromEntries(CRITERIA.map(({ id }) => [id, 8])),
    criterion_reasoning: Object.fromEntries(CRITERIA.map(({ id }) => [id, 'Visible image evidence.'])),
    weighted_score: 8, strengths: [], concerns: [], india_specific_observations: [], confidence: 0.8,
  };
}
function results() {
  return PERSONAS.map((persona) => ({
    persona_id: persona.personaId, persona_name: persona.name, status: 'valid',
    evaluations: MODEL_SLOTS.map((slot) => evaluation(persona, slot)),
    failed_evaluations: [], error_code: null,
  }));
}

test('one persona produces three evaluations with matching aggregate denominators', () => {
  const aggregate = aggregateResults('test', results());
  assert.equal(PERSONAS.length, 1);
  assert.equal(aggregate.expected_persona_count, 1);
  assert.equal(aggregate.completed_image_evaluations, 3);
  assert.equal(aggregate.status, 'completed');
  assert.ok(aggregate.overall_winner);
  assert.ok(aggregate.images.every((image) => image.valid_persona_count === 1));
});

test('partial results retain scores but cannot declare a winner', () => {
  const input = results();
  input[0].evaluations.pop();
  const aggregate = aggregateResults('test', input);
  assert.equal(aggregate.completed_image_evaluations, 2);
  assert.equal(aggregate.status, 'completed_with_warnings');
  assert.equal(aggregate.overall_winner, null);
  assert.equal(aggregate.images[2].valid_persona_count, 0);
});

test('all ten criterion scores and reasons are required', () => {
  const valid = evaluation(PERSONAS[0], MODEL_SLOTS[0]);
  const validate = (value) => validatePersonaImageResponse(JSON.stringify(value), valid.persona_id, valid.image_id, valid.model_name);
  assert.equal(validate(valid).weighted_score, 8);
  assert.throws(() => validate({ ...valid, criterion_scores: {}, weighted_score: 0 }));
  const missingReason = { ...valid, criterion_reasoning: { ...valid.criterion_reasoning } };
  delete missingReason.criterion_reasoning.promptAdherence;
  assert.throws(() => validate(missingReason));
});

test('provider receives exact persona ID and a bounded output budget', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GROQ_API_KEY;
  const originalModel = process.env.GROQ_MODEL;
  process.env.GROQ_API_KEY = 'mock-test-key';
  delete process.env.GROQ_MODEL;
  let request;
  globalThis.fetch = async (_url, options) => {
    request = JSON.parse(options.body);
    return new globalThis.Response(JSON.stringify({ choices: [{ message: { content: '{}' } }] }), { status: 200 });
  };
  try {
    await groqProvider.evaluatePersonaImage({ image: { imageId: 'image1', modelName: 'GPT-Image-2.5', mimeType: 'image/png', dataUrl: 'data:image/png;base64,AA==' }, rubric: 'rubric' }, PERSONAS[0]);
    assert.ok(JSON.stringify(request.messages).includes(PERSONAS[0].personaId));
    assert.equal(request.max_completion_tokens, 2000);
    assert.equal(request.reasoning_effort, 'none');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = originalKey;
    if (originalModel === undefined) delete process.env.GROQ_MODEL; else process.env.GROQ_MODEL = originalModel;
  }
});

test('server returns 429 cooldown without retrying or capping the delay', async () => {
  const original = groqProvider.evaluatePersonaImage;
  let calls = 0;
  groqProvider.evaluatePersonaImage = async () => {
    calls += 1;
    throw new GroqRequestError('Rate limited', 429, null, true, 180_000);
  };
  try {
    const response = await handler({ httpMethod: 'POST', body: JSON.stringify({ personaId: PERSONAS[0].personaId, imageId: 'image1', modelName: 'GPT-Image-2.5', mimeType: 'image/png', dataUrl: 'data:image/png;base64,AA==' }) });
    assert.equal(calls, 1);
    assert.equal(response.statusCode, 429);
    assert.equal(response.headers['Retry-After'], '180');
    assert.equal(JSON.parse(response.body).retryAfterMs, 180_000);
  } finally {
    groqProvider.evaluatePersonaImage = original;
  }
});

test('API errors preserve error code and retry duration', async () => {
  await assert.rejects(readApiResponse(new globalThis.Response(JSON.stringify({ error: 'provider_rate_limited' }), { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '75' } }), '/api/evaluate-agent'), (error) => error instanceof ApiError && error.code === 'provider_rate_limited' && error.retryAfterMs === 75_000);
});

test('browser honors provider cooldown and retries only the failed request', async () => {
  let calls = 0;
  const waits = [];
  const value = await evaluateWithCooldown(async () => {
    calls += 1;
    if (calls === 1) throw new ApiError(429, 'provider_rate_limited', 75_000, 'rate limited');
    return 'completed';
  }, () => {}, async (milliseconds) => { waits.push(milliseconds); });
  assert.equal(value, 'completed');
  assert.equal(calls, 2);
  assert.deepEqual(waits, [75_000]);
});

test('long quota cooldowns and permanent errors stop instead of retrying', async () => {
  for (const error of [new ApiError(429, 'provider_rate_limited', 180_000, 'rate limited'), new ApiError(502, 'provider_authentication_failed', null, 'auth failed')]) {
    let calls = 0;
    await assert.rejects(evaluateWithCooldown(async () => { calls += 1; throw error; }, () => {}, async () => assert.fail('must not wait')), (caught) => caught === error);
    assert.equal(calls, 1);
  }
});

test('repeated rate limits have a bounded retry count', async () => {
  let calls = 0;
  let waits = 0;
  await assert.rejects(evaluateWithCooldown(async () => { calls += 1; throw new ApiError(429, 'provider_rate_limited', 1000, 'rate limited'); }, () => {}, async () => { waits += 1; }));
  assert.equal(calls, 3);
  assert.equal(waits, 2);
});
