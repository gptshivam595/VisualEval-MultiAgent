export const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
export const DEFAULT_GROQ_MODEL = 'qwen/qwen3.8-27b';
const DEPRECATED_GROQ_MODELS = new Set([
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'meta-llama/llama-4-maverick-17b-128e-instruct',
]);

export function getGroqModel(): string {
  const configuredModel = process.env.GROQ_MODEL?.trim();
  if (!configuredModel || DEPRECATED_GROQ_MODELS.has(configuredModel)) {
    if (configuredModel) {
      console.warn('[groq] deprecated GROQ_MODEL configured; using supported default', {
        configuredModel,
        replacementModel: DEFAULT_GROQ_MODEL,
      });
    }
    return DEFAULT_GROQ_MODEL;
  }
  return configuredModel;
}
