import { ApiError } from './api';

export const REQUEST_SPACING_MS = 45_000;
const MAX_RATE_LIMIT_RETRIES = 2;
const MAX_AUTOMATIC_WAIT_MS = 120_000;

export async function evaluateWithCooldown<T>(
  request: () => Promise<T>,
  onWait: (milliseconds: number) => void,
  wait: (milliseconds: number) => Promise<void> = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 429 || attempt >= MAX_RATE_LIMIT_RETRIES) throw error;
      const delay = Math.max(1_000, error.retryAfterMs ?? 60_000);
      if (delay > MAX_AUTOMATIC_WAIT_MS) throw error;
      onWait(delay);
      await wait(delay);
    }
  }
}
