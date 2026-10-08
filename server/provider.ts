import type { Persona } from './types.js';

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

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const groqProvider: LlmProvider = {
  async evaluatePersona(context, persona) {
    const apiKey = getEnv('GROQ_API_KEY');
    const model = process.env.GROQ_MODEL ?? 'meta-llama/llama-4-scout-17b-16e-instruct';
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
      'Return a JSON array with exactly three objects, one for image1, image2, and image3. Every object must contain exactly these fields: persona_id, persona_name, image_id, model_name, criterion_scores, criterion_reasoning, weighted_score, strengths, concerns, india_specific_observations, confidence.',
      'criterion_scores and criterion_reasoning must contain every supplied criterion ID. weighted_score must be the weighted 0-10 calculation from criterion_scores.',
      `Persona: ${persona.name}. Context: ${persona.description}. Evaluation lens: ${persona.evaluationLens}.`,
      `Rubric:\n${context.rubric}`,
    ].join('\n\n');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: imageContent },
        ],
      }),
      signal: AbortSignal.timeout(90_000),
    });

    if (!response.ok) {
      throw new Error(`Groq request failed with status ${response.status}`);
    }
    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error('Provider returned empty content');
    return { content };
  },
};
