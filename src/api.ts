export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, public readonly retryAfterMs: number | null, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const AGENT_API_PATH = '/api/evaluate-agent';

function shortResponseBody(body: string): string {
  return body.replace(/\s+/g, ' ').trim().slice(0, 240);
}

export async function readApiResponse<T>(response: Response, path: string): Promise<T> {
  const contentType = response.headers.get('content-type') ?? 'unknown';
  const body = await response.text();
  const isJson = contentType.toLowerCase().includes('application/json');

  if (!response.ok) {
    const detail = isJson ? parseJsonError(body) : shortResponseBody(body);
    const seconds = Number(response.headers.get('retry-after'));
    const retryAfterMs = response.headers.has('retry-after') && Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : null;
    throw new ApiError(response.status, detail, retryAfterMs, `${path} returned HTTP ${response.status} (${contentType}): ${detail || 'No response body'}`);
  }

  if (!isJson) {
    throw new Error(`${path} returned non-JSON content (HTTP ${response.status}, ${contentType}): ${shortResponseBody(body) || 'No response body'}`);
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error(`${path} returned invalid JSON (HTTP ${response.status}, ${contentType}): ${shortResponseBody(body)}`);
  }
}

function parseJsonError(body: string): string {
  try {
    const parsed = JSON.parse(body) as { error?: string; message?: string };
    return parsed.error ?? parsed.message ?? shortResponseBody(body);
  } catch {
    return shortResponseBody(body);
  }
}
